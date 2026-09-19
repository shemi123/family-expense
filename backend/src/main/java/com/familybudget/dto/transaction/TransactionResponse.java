package com.familybudget.dto.transaction;

import com.familybudget.domain.entity.Transaction;
import com.familybudget.domain.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
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
    private LocalDate date;
    private String notes;
    private String receiptUrl;
    private Boolean isRecurring;
    private UUID recurringTransactionId;
    private OffsetDateTime createdAt;

    public static TransactionResponse from(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .accountId(t.getAccount().getId())
                .accountName(t.getAccount().getName())
                .categoryId(t.getCategory().getId())
                .categoryName(t.getCategory().getName())
                .categoryIcon(t.getCategory().getIcon())
                .categoryColor(t.getCategory().getColor())
                .userId(t.getUser().getId())
                .userName(t.getUser().getName())
                .amount(t.getAmount())
                .type(t.getType())
                .date(t.getDate())
                .notes(t.getNotes())
                .receiptUrl(t.getReceiptUrl())
                .isRecurring(t.getIsRecurring())
                .recurringTransactionId(t.getRecurringTransaction() != null ? t.getRecurringTransaction().getId() : null)
                .createdAt(t.getCreatedAt())
                .build();
    }
}
