package com.familybudget.repository;

import com.familybudget.domain.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, UUID> {

    List<RecurringTransaction> findAllByFamilyIdOrderByNextExecutionDateAsc(UUID familyId);

    List<RecurringTransaction> findAllByIsActiveTrueAndNextExecutionDateLessThanEqual(LocalDate date);

    Optional<RecurringTransaction> findByIdAndFamilyId(UUID id, UUID familyId);
}
