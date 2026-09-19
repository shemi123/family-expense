package com.familybudget.dto.transaction;

import com.familybudget.domain.enums.Frequency;
import com.familybudget.domain.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TransactionRequest {
    @NotNull(message = "Account ID is required")
    private UUID accountId;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be strictly positive")
    private BigDecimal amount;

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String notes;

    private String receiptUrl;

    private Boolean isRecurring = false;

    // Optional recurring parameters if creating recurring schedule simultaneously
    private Frequency frequency;
    private Integer intervalCount = 1;
    private LocalDate recurringEndDate;
}
