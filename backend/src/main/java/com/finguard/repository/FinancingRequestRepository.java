package com.finguard.repository;

import com.finguard.entity.FinancingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinancingRequestRepository extends JpaRepository<FinancingRequest, Long> {
}
