package com.familybudget.service;

import com.familybudget.domain.entity.*;
import com.familybudget.domain.enums.Frequency;
import com.familybudget.domain.enums.TransactionType;
import com.familybudget.dto.recurring.RecurringTransactionRequest;
import com.familybudget.dto.recurring.RecurringTransactionResponse;
import com.familybudget.exception.BadRequestException;
import com.familybudget.exception.ResourceNotFoundException;
import com.familybudget.repository.FamilyRepository;
import com.familybudget.repository.RecurringTransactionRepository;
import com.familybudget.repository.TransactionRepository;
import com.familybudget.repository.UserRepository;
import com.familybudget.security.TenantContext;
import com.familybudget.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepository;
    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<RecurringTransactionResponse> getRecurringTransactions() {
        UUID familyId = TenantContext.getCurrentFamilyId();
        return recurringRepository.findAllByFamilyIdOrderByNextExecutionDateAsc(familyId).stream()
                .map(RecurringTransactionResponse::from)
                .toList();
    }

    @Transactional
    public RecurringTransactionResponse createRecurring(RecurringTransactionRequest request, UserPrincipal currentUser) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Family not found"));

        Account account = accountService.getAccountEntity(request.getAccountId());
        Category category = categoryService.getCategoryEntity(request.getCategoryId());
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be earlier than start date");
        }

        RecurringTransaction recurring = RecurringTransaction.builder()
                .family(family)
                .account(account)
                .category(category)
                .user(user)
                .amount(request.getAmount())
                .type(request.getType())
                .frequency(request.getFrequency())
                .intervalCount(request.getIntervalCount() != null ? request.getIntervalCount() : 1)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .nextExecutionDate(request.getStartDate())
                .notes(request.getNotes())
                .isActive(true)
                .build();

        recurring = recurringRepository.save(recurring);
        return RecurringTransactionResponse.from(recurring);
    }

    @Transactional
    public RecurringTransactionResponse toggleActive(UUID id) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        RecurringTransaction recurring = recurringRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));

        recurring.setIsActive(!recurring.getIsActive());
        recurring = recurringRepository.save(recurring);
        return RecurringTransactionResponse.from(recurring);
    }

    @Transactional
    public void deleteRecurring(UUID id) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        RecurringTransaction recurring = recurringRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));

        recurringRepository.delete(recurring);
    }

    @Transactional
    public int processDueRecurringTransactions(LocalDate asOfDate) {
        List<RecurringTransaction> dueList = recurringRepository.findAllByIsActiveTrueAndNextExecutionDateLessThanEqual(asOfDate);
        int generatedCount = 0;

        for (RecurringTransaction recurring : dueList) {
            try {
                // Generate ledger transaction
                Transaction transaction = Transaction.builder()
                        .family(recurring.getFamily())
                        .account(recurring.getAccount())
                        .category(recurring.getCategory())
                        .user(recurring.getUser())
                        .recurringTransaction(recurring)
                        .amount(recurring.getAmount())
                        .type(recurring.getType())
                        .date(recurring.getNextExecutionDate())
                        .notes(recurring.getNotes() != null ? "[Auto-Generated] " + recurring.getNotes() : "[Auto-Generated Recurring Transaction]")
                        .isRecurring(true)
                        .build();

                transactionRepository.save(transaction);

                // Adjust running balance
                BigDecimal balanceDelta = recurring.getType() == TransactionType.INCOME
                        ? recurring.getAmount()
                        : recurring.getAmount().negate();
                accountService.applyBalanceChange(recurring.getAccount(), balanceDelta);

                // Advance next execution date
                recurring.setLastExecutedDate(recurring.getNextExecutionDate());
                LocalDate nextDate = calculateNextDate(recurring.getNextExecutionDate(), recurring.getFrequency(), recurring.getIntervalCount());
                recurring.setNextExecutionDate(nextDate);

                if (recurring.getEndDate() != null && nextDate.isAfter(recurring.getEndDate())) {
                    recurring.setIsActive(false);
                }

                recurringRepository.save(recurring);
                generatedCount++;
            } catch (Exception ex) {
                log.error("Failed to generate transaction for recurring ID {}: {}", recurring.getId(), ex.getMessage(), ex);
            }
        }

        return generatedCount;
    }

    private LocalDate calculateNextDate(LocalDate currentDate, Frequency frequency, int interval) {
        return switch (frequency) {
            case DAILY -> currentDate.plusDays(interval);
            case WEEKLY -> currentDate.plusWeeks(interval);
            case BI_WEEKLY -> currentDate.plusWeeks(interval * 2L);
            case MONTHLY -> currentDate.plusMonths(interval);
            case YEARLY -> currentDate.plusYears(interval);
        };
    }
}
