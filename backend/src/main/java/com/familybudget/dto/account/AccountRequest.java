package com.familybudget.dto.account;

import com.familybudget.domain.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {
    @NotBlank(message = "Account name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotNull(message = "Account type is required")
    private AccountType type;

    private BigDecimal initialBalance = BigDecimal.ZERO;

    private String currency = "USD";

    private String description;
}
