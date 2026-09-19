package com.familybudget.dto.category;

import com.familybudget.domain.entity.Category;
import com.familybudget.domain.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private UUID id;
    private String name;
    private TransactionType type;
    private String icon;
    private String color;
    private Boolean isSystem;
    private UUID familyId;

    public static CategoryResponse from(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .isSystem(category.getIsSystem())
                .familyId(category.getFamily() != null ? category.getFamily().getId() : null)
                .build();
    }
}
