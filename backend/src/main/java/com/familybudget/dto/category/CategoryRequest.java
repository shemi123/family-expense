package com.familybudget.dto.category;

import com.familybudget.domain.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotNull(message = "Category type is required")
    private TransactionType type;

    private String icon = "Tag";

    private String color = "#64748b";
}
