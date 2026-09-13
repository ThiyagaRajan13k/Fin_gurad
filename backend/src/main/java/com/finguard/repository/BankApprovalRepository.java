package com.finguard.repository;

import com.finguard.entity.BankApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BankApprovalRepository extends JpaRepository<BankApproval, Long> {
    Optional<BankApproval> findByFinancingRequestId(Long financingRequestId);
}
