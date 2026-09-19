package com.familybudget.dto.recurring;

import com.familybudget.domain.entity.RecurringTransaction;
import com.familybudget.domain.enums.Frequency;
import com.familybudget.domain.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringTransactionResponse {
    private UUID id;
    private UUID accountId;
    private String accountName;
    private UUID categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private UUID userId;
    private String userName;
    private BigDecimal amount;
    private TransactionType type;
    private Frequency frequency;
    private Integer intervalCount;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextExecutionDate;
    private LocalDate lastExecutedDate;
    private String notes;
    private Boolean isActive;

    public static RecurringTransactionResponse from(RecurringTransaction rt) {
        return RecurringTransactionResponse.builder()
                .id(rt.getId())
                .accountId(rt.getAccount().getId())
                .accountName(rt.getAccount().getName())
                .categoryId(rt.getCategory().getId())
                .categoryName(rt.getCategory().getName())
                .categoryIcon(rt.getCategory().getIcon())
                .categoryColor(rt.getCategory().getColor())
                .userId(rt.getUser().getId())
                .userName(rt.getUser().getName())
                .amount(rt.getAmount())
                .type(rt.getType())
                .frequency(rt.getFrequency())
                .intervalCount(rt.getIntervalCount())
                .startDate(rt.getStartDate())
                .endDate(rt.getEndDate())
                .nextExecutionDate(rt.getNextExecutionDate())
                .lastExecutedDate(rt.getLastExecutedDate())
                .notes(rt.getNotes())
                .isActive(rt.getIsActive())
                .build();
    }
}
