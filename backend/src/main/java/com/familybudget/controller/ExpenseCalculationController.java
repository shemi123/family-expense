package com.familybudget.controller;

import com.familybudget.dto.expense.ExpenseCalculationFilterParams;
import com.familybudget.dto.expense.ExpenseCalculationResponse;
import com.familybudget.service.ExpenseCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/expense-calculation")
@RequiredArgsConstructor
@Tag(name = "Expense Calculation", description = "Endpoints for calculating spending analytics, averages, and comparisons")
public class ExpenseCalculationController {

    private final ExpenseCalculationService expenseCalculationService;

    @GetMapping
    @Operation(summary = "Get calculated expense metrics, period comparisons, and category breakdowns")
    public ResponseEntity<ExpenseCalculationResponse> getExpenseCalculation(ExpenseCalculationFilterParams filterParams) {
        return ResponseEntity.ok(expenseCalculationService.calculateExpenses(filterParams));
    }
}
