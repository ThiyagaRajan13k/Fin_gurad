package com.finguard.repository;

import com.finguard.entity.FinancingRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FinancingRequestItemRepository extends JpaRepository<FinancingRequestItem, Long> {
    List<FinancingRequestItem> findByInvoiceId(Long invoiceId);
    List<FinancingRequestItem> findByInvoiceIdAndFinancingRequestIdNot(Long invoiceId, Long financingRequestId);
}
