package com.familybudget.dto.transaction;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkTransactionRequest {
    @NotEmpty(message = "Transaction list cannot be empty")
    @Valid
    private List<TransactionRequest> transactions;
}
