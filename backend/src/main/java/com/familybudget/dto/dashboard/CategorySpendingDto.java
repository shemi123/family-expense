package com.familybudget.dto.dashboard;

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
public class CategorySpendingDto {
    private UUID categoryId;
    private String categoryName;
    private String color;
    private String icon;
    private BigDecimal amount;
    private Double percentage;
}
