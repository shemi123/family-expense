package com.familybudget.service;

import com.familybudget.domain.entity.Account;
import com.familybudget.domain.entity.Family;
import com.familybudget.dto.account.AccountRequest;
import com.familybudget.dto.account.AccountResponse;
import com.familybudget.exception.BadRequestException;
import com.familybudget.exception.ResourceNotFoundException;
import com.familybudget.repository.AccountRepository;
import com.familybudget.repository.FamilyRepository;
import com.familybudget.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final FamilyRepository familyRepository;

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts() {
        UUID familyId = TenantContext.getCurrentFamilyId();
        return accountRepository.findAllByFamilyIdAndIsActiveTrueOrderByCreatedAtDesc(familyId).stream()
                .map(AccountResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccount(UUID id) {
        return AccountResponse.from(getAccountEntity(id));
    }

    @Transactional(readOnly = true)
    public Account getAccountEntity(UUID id) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        return accountRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));
    }

    @Transactional
    public AccountResponse createAccount(AccountRequest request) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Family not found"));

        BigDecimal initialBalance = request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO;

        Account account = Account.builder()
                .family(family)
                .name(request.getName().trim())
                .type(request.getType())
                .balance(initialBalance)
                .currency(request.getCurrency() != null ? request.getCurrency() : family.getCurrency())
                .description(request.getDescription())
                .isActive(true)
                .build();

        account = accountRepository.save(account);
        return AccountResponse.from(account);
    }

    @Transactional
    public AccountResponse updateAccount(UUID id, AccountRequest request) {
        Account account = getAccountEntity(id);

        account.setName(request.getName().trim());
        account.setType(request.getType());
        if (request.getCurrency() != null) {
            account.setCurrency(request.getCurrency());
        }
        account.setDescription(request.getDescription());

        account = accountRepository.save(account);
        return AccountResponse.from(account);
    }

    @Transactional
    public void deleteAccount(UUID id) {
        Account account = getAccountEntity(id);
        account.setIsActive(false);
        accountRepository.save(account);
    }

    @Transactional
    public void applyBalanceChange(Account account, BigDecimal delta) {
        account.setBalance(account.getBalance().add(delta));
        accountRepository.save(account);
    }
}
