package com.familybudget.repository;

import com.familybudget.domain.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    List<Account> findAllByFamilyIdAndIsActiveTrueOrderByCreatedAtDesc(UUID familyId);

    List<Account> findAllByFamilyIdOrderByCreatedAtDesc(UUID familyId);

    Optional<Account> findByIdAndFamilyId(UUID id, UUID familyId);
}
