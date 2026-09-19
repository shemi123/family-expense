package com.familybudget.dto.budget;

import com.familybudget.domain.entity.Budget;
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
public class BudgetResponse {
    private UUID id;
    private UUID categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private Integer month;
    private Integer year;
    private BigDecimal limitAmount;

    public static BudgetResponse from(Budget b) {
        return BudgetResponse.builder()
                .id(b.getId())
                .categoryId(b.getCategory().getId())
                .categoryName(b.getCategory().getName())
                .categoryIcon(b.getCategory().getIcon())
                .categoryColor(b.getCategory().getColor())
                .month(b.getMonth())
                .year(b.getYear())
                .limitAmount(b.getLimitAmount())
                .build();
    }
}
