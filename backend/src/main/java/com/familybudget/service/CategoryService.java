package com.familybudget.service;

import com.familybudget.domain.entity.Category;
import com.familybudget.domain.entity.Family;
import com.familybudget.domain.enums.TransactionType;
import com.familybudget.dto.category.CategoryRequest;
import com.familybudget.dto.category.CategoryResponse;
import com.familybudget.exception.BadRequestException;
import com.familybudget.exception.ResourceNotFoundException;
import com.familybudget.exception.UnauthorizedException;
import com.familybudget.repository.CategoryRepository;
import com.familybudget.repository.FamilyRepository;
import com.familybudget.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final FamilyRepository familyRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        UUID familyId = TenantContext.getCurrentFamilyId();
        return categoryRepository.findAllAvailableForFamily(familyId).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(TransactionType type) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        return categoryRepository.findAllAvailableForFamilyAndType(familyId, type).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Category getCategoryEntity(UUID id) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        return categoryRepository.findAvailableById(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Family not found"));

        if (categoryRepository.existsByFamilyIdAndNameIgnoreCase(familyId, request.getName().trim())) {
            throw new BadRequestException("A category with this name already exists in your family");
        }

        Category category = Category.builder()
                .family(family)
                .name(request.getName().trim())
                .type(request.getType())
                .icon(request.getIcon() != null ? request.getIcon() : "Tag")
                .color(request.getColor() != null ? request.getColor() : "#64748b")
                .isSystem(false)
                .build();

        category = categoryRepository.save(category);
        return CategoryResponse.from(category);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Category category = categoryRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or is a system category that cannot be modified"));

        category.setName(request.getName().trim());
        category.setType(request.getType());
        if (request.getIcon() != null) category.setIcon(request.getIcon());
        if (request.getColor() != null) category.setColor(request.getColor());

        category = categoryRepository.save(category);
        return CategoryResponse.from(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        UUID familyId = TenantContext.getCurrentFamilyId();
        Category category = categoryRepository.findByIdAndFamilyId(id, familyId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or is a system category that cannot be deleted"));

        categoryRepository.delete(category);
    }
}
