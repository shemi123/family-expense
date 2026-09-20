package com.familybudget.controller;

import com.familybudget.dto.common.PagedResponse;
import com.familybudget.dto.transaction.BulkTransactionRequest;
import com.familybudget.dto.transaction.TransactionFilterParams;
import com.familybudget.dto.transaction.TransactionRequest;
import com.familybudget.dto.transaction.TransactionResponse;
import com.familybudget.security.UserPrincipal;
import com.familybudget.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Endpoints for managing family income and expense transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "Get paginated, filterable transactions")
    public ResponseEntity<PagedResponse<TransactionResponse>> getTransactions(
            TransactionFilterParams filterParams,
            @PageableDefault(size = 20, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(transactionService.getTransactions(filterParams, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.getTransaction(id));
    }

    @PostMapping
    @Operation(summary = "Create a new transaction and update account balance")
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.createTransaction(request, currentUser));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Create multiple transactions in a single batch and update account balances")
    public ResponseEntity<List<TransactionResponse>> createBulkTransactions(
            @Valid @RequestBody BulkTransactionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.createBulkTransactions(request, currentUser));
    }


    @PutMapping("/{id}")
    @Operation(summary = "Update an existing transaction and readjust balances")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction and reverse balance change")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
