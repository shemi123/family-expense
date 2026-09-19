package com.familybudget.repository;

import com.familybudget.domain.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findAllByFamilyIdAndMonthAndYear(UUID familyId, Integer month, Integer year);

    Optional<Budget> findByFamilyIdAndCategoryIdAndMonthAndYear(UUID familyId, UUID categoryId, Integer month, Integer year);

    Optional<Budget> findByIdAndFamilyId(UUID id, UUID familyId);
}
