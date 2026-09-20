package com.familybudget.dto.expense;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryExpenseCalculationDto {
    private UUID categoryId;
    private String categoryName;
    private String icon;
    private String color;
    private BigDecimal amount;
    private Double percentage;
    private Long transactionCount;
    private BigDecimal averageTransactionAmount;
}
