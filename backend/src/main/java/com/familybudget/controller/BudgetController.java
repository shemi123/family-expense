package com.familybudget.controller;

import com.familybudget.dto.budget.BudgetRequest;
import com.familybudget.dto.budget.BudgetResponse;
import com.familybudget.dto.budget.BudgetSummaryResponse;
import com.familybudget.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Endpoints for setting and monitoring category spending limits")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Get budgets for specified month and year")
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(budgetService.getBudgets(m, y));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get budget limit tracking and over-budget alerts for month and year")
    public ResponseEntity<List<BudgetSummaryResponse>> getBudgetSummaries(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(budgetService.getBudgetSummaries(m, y));
    }

    @PostMapping
    @Operation(summary = "Set or update monthly category budget limit")
    public ResponseEntity<BudgetResponse> setBudget(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.setBudget(request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete budget limit")
    public ResponseEntity<Void> deleteBudget(@PathVariable UUID id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
