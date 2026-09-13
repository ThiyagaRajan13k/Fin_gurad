package com.finguard.repository;

import com.finguard.entity.FinancingRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinancingRequestItemRepository extends JpaRepository<FinancingRequestItem, Long> {
}
