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
public class UserExpenseCalculationDto {
    private UUID userId;
    private String userName;
    private BigDecimal amount;
    private Double percentage;
    private Long transactionCount;
}
