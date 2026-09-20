package com.familybudget.service;

import com.familybudget.domain.entity.*;
import com.familybudget.domain.enums.TransactionType;
import com.familybudget.dto.common.PagedResponse;
import com.familybudget.dto.recurring.RecurringTransactionRequest;
import com.familybudget.dto.transaction.BulkTransactionRequest;
import com.familybudget.dto.transaction.TransactionFilterParams;
import com.familybudget.dto.transaction.TransactionRequest;
import com.familybudget.dto.transaction.TransactionResponse;
import com.familybudget.exception.ResourceNotFoundException;
import com.familybudget.repository.FamilyRepository;
import com.familybudget.repository.TransactionRepository;
import com.familybudget.repository.TransactionSpecification;
import com.familybudget.repository.UserRepository;
import com.familybudget.security.TenantContext;
import com.familybudget.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final RecurringTransactionService recurringTransactionService;

    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> getTransactions(TransactionFilterParams filter, Pageable pageable) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Specification<Transaction> spec = TransactionSpecification.withFilter(familyId, filter);
        Page<Transaction> page = transactionRepository.findAll(spec, pageable);
        return PagedResponse.from(page.map(TransactionResponse::from));
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(UUID id) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Transaction transaction = transactionRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));
        return TransactionResponse.from(transaction);
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, UserPrincipal currentUser) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Family not found"));

        Account account = accountService.getAccountEntity(request.getAccountId());
        Category category = categoryService.getCategoryEntity(request.getCategoryId());
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Transaction transaction = Transaction.builder()
                .family(family)
                .account(account)
                .category(category)
                .user(user)
                .amount(request.getAmount())
                .type(request.getType())
                .date(request.getDate())
                .notes(request.getNotes())
                .receiptUrl(request.getReceiptUrl())
                .isRecurring(Boolean.TRUE.equals(request.getIsRecurring()))
                .batchId(request.getBatchId())
                .build();

        // If recurrence is requested and frequency provided, create schedule
        if (Boolean.TRUE.equals(request.getIsRecurring()) && request.getFrequency() != null) {
            RecurringTransactionRequest recurringReq = new RecurringTransactionRequest();
            recurringReq.setAccountId(request.getAccountId());
            recurringReq.setCategoryId(request.getCategoryId());
            recurringReq.setAmount(request.getAmount());
            recurringReq.setType(request.getType());
            recurringReq.setFrequency(request.getFrequency());
            recurringReq.setIntervalCount(request.getIntervalCount() != null ? request.getIntervalCount() : 1);
            recurringReq.setStartDate(request.getDate());
            recurringReq.setEndDate(request.getRecurringEndDate());
            recurringReq.setNotes(request.getNotes());

            var recurringResp = recurringTransactionService.createRecurring(recurringReq, currentUser);
            RecurringTransaction rt = new RecurringTransaction();
            rt.setId(recurringResp.getId());
            transaction.setRecurringTransaction(rt);
        }

        transaction = transactionRepository.save(transaction);

        // Adjust running balance
        BigDecimal balanceDelta = request.getType() == TransactionType.INCOME
                ? request.getAmount()
                : request.getAmount().negate();
        accountService.applyBalanceChange(account, balanceDelta);

        return TransactionResponse.from(transaction);
    }

    @Transactional
    public List<TransactionResponse> createBulkTransactions(BulkTransactionRequest bulkRequest, UserPrincipal currentUser) {
        UUID sharedBatchId = UUID.randomUUID();
        List<TransactionResponse> responses = new ArrayList<>();
        if (bulkRequest.getTransactions() != null) {
            for (TransactionRequest request : bulkRequest.getTransactions()) {
                if (request.getBatchId() == null) {
                    request.setBatchId(sharedBatchId);
                }
                responses.add(createTransaction(request, currentUser));
            }
        }
        return responses;
    }


    @Transactional
    public TransactionResponse updateTransaction(UUID id, TransactionRequest request) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Transaction transaction = transactionRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        Account oldAccount = transaction.getAccount();
        BigDecimal oldDelta = transaction.getType() == TransactionType.INCOME
                ? transaction.getAmount().negate()
                : transaction.getAmount();

        Account newAccount = accountService.getAccountEntity(request.getAccountId());
        Category newCategory = categoryService.getCategoryEntity(request.getCategoryId());

        // Revert old impact on old account
        accountService.applyBalanceChange(oldAccount, oldDelta);

        // Apply new impact on new account
        BigDecimal newDelta = request.getType() == TransactionType.INCOME
                ? request.getAmount()
                : request.getAmount().negate();
        accountService.applyBalanceChange(newAccount, newDelta);

        // Update transaction attributes
        transaction.setAccount(newAccount);
        transaction.setCategory(newCategory);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setNotes(request.getNotes());
        transaction.setReceiptUrl(request.getReceiptUrl());

        transaction = transactionRepository.save(transaction);
        return TransactionResponse.from(transaction);
    }

    @Transactional
    public void deleteTransaction(UUID id) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Transaction transaction = transactionRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        // Revert balance impact
        Account account = transaction.getAccount();
        BigDecimal reverseDelta = transaction.getType() == TransactionType.INCOME
                ? transaction.getAmount().negate()
                : transaction.getAmount();
        accountService.applyBalanceChange(account, reverseDelta);

        transactionRepository.delete(transaction);
    }
}
