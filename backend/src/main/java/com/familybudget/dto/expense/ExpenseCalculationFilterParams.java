package com.familybudget.dto.expense;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ExpenseCalculationFilterParams {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    private String period; // THIS_MONTH, LAST_MONTH, LAST_30_DAYS, LAST_90_DAYS, THIS_YEAR, CUSTOM

    private UUID accountId;
    private UUID categoryId;
    private UUID userId;
}
