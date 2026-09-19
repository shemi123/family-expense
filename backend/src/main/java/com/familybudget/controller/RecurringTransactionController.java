package com.familybudget.controller;

import com.familybudget.dto.recurring.RecurringTransactionRequest;
import com.familybudget.dto.recurring.RecurringTransactionResponse;
import com.familybudget.security.UserPrincipal;
import com.familybudget.service.RecurringTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recurring")
@RequiredArgsConstructor
@Tag(name = "Recurring Transactions", description = "Endpoints for scheduling and managing recurring income and expenses")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;

    @GetMapping
    @Operation(summary = "Get all recurring transaction schedules for family")
    public ResponseEntity<List<RecurringTransactionResponse>> getRecurring() {
        return ResponseEntity.ok(recurringService.getRecurringTransactions());
    }

    @PostMapping
    @Operation(summary = "Create recurring transaction schedule")
    public ResponseEntity<RecurringTransactionResponse> createRecurring(
            @Valid @RequestBody RecurringTransactionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recurringService.createRecurring(request, currentUser));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle active / pause state of recurring transaction")
    public ResponseEntity<RecurringTransactionResponse> toggleActive(@PathVariable UUID id) {
        return ResponseEntity.ok(recurringService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete recurring schedule")
    public ResponseEntity<Void> deleteRecurring(@PathVariable UUID id) {
        recurringService.deleteRecurring(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/process")
    @Operation(summary = "Manually trigger batch processing for due recurring transactions")
    public ResponseEntity<Map<String, Object>> processDue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        int generatedCount = recurringService.processDueRecurringTransactions(date);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "processedDate", date.toString(),
                "generatedTransactions", generatedCount
        ));
    }
}
