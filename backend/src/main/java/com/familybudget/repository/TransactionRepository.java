package com.familybudget.repository;

import com.familybudget.domain.entity.Transaction;
import com.familybudget.domain.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndFamilyId(UUID id, UUID familyId);

    List<Transaction> findTop5ByFamilyIdOrderByDateDescCreatedAtDesc(UUID familyId);

    @Query("""
        SELECT c.id as categoryId, c.name as categoryName, c.color as color, c.icon as icon, SUM(t.amount) as totalAmount
        FROM Transaction t
        JOIN t.category c
        WHERE t.family.id = :familyId
          AND t.type = :type
          AND t.date BETWEEN :startDate AND :endDate
        GROUP BY c.id, c.name, c.color, c.icon
        ORDER BY totalAmount DESC
    """)
    List<CategorySpendProjection> findCategorySpend(
            @Param("familyId") UUID familyId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.family.id = :familyId
          AND t.category.id = :categoryId
          AND t.type = :type
          AND t.date BETWEEN :startDate AND :endDate
    """)
    BigDecimal calculateTotalForCategoryAndPeriod(
            @Param("familyId") UUID familyId,
            @Param("categoryId") UUID categoryId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.family.id = :familyId
          AND t.type = :type
          AND t.date BETWEEN :startDate AND :endDate
    """)
    BigDecimal calculateTotalForTypeAndPeriod(
            @Param("familyId") UUID familyId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    interface CategorySpendProjection {
        UUID getCategoryId();
        String getCategoryName();
        String getColor();
        String getIcon();
        BigDecimal getTotalAmount();
    }
}
