package com.familybudget.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDto {
    private String monthYear; // e.g. "2026-04" or "Apr 2026"
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal netSavings;
}
