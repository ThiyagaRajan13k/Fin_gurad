package com.finguard.repository;

import com.finguard.entity.FraudReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FraudReportRepository extends JpaRepository<FraudReport, Long> {
    Optional<FraudReport> findByFinancingRequestId(Long financingRequestId);
    boolean existsByFinancingRequestId(Long financingRequestId);
}
