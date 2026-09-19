package com.familybudget.repository;

import com.familybudget.domain.entity.Category;
import com.familybudget.domain.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("SELECT c FROM Category c WHERE c.family.id = :familyId OR c.isSystem = true ORDER BY c.type ASC, c.name ASC")
    List<Category> findAllAvailableForFamily(@Param("familyId") UUID familyId);

    @Query("SELECT c FROM Category c WHERE (c.family.id = :familyId OR c.isSystem = true) AND c.type = :type ORDER BY c.name ASC")
    List<Category> findAllAvailableForFamilyAndType(@Param("familyId") UUID familyId, @Param("type") TransactionType type);

    @Query("SELECT c FROM Category c WHERE c.id = :id AND (c.family.id = :familyId OR c.isSystem = true)")
    Optional<Category> findAvailableById(@Param("id") UUID id, @Param("familyId") UUID familyId);

    Optional<Category> findByIdAndFamilyId(UUID id, UUID familyId);

    boolean existsByFamilyIdAndNameIgnoreCase(UUID familyId, String name);
}
