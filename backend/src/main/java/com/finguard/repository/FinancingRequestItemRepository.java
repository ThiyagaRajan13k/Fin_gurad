package com.finguard.repository;

import com.finguard.entity.FinancingRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FinancingRequestItemRepository extends JpaRepository<FinancingRequestItem, Long> {

    @Query("SELECT fri FROM FinancingRequestItem fri WHERE fri.financingRequest.id = :financingRequestId")
    List<FinancingRequestItem> findByFinancingRequestId(@Param("financingRequestId") Long financingRequestId);

    @Query("SELECT fri FROM FinancingRequestItem fri WHERE fri.invoice.id = :invoiceId AND fri.financingRequest.id != :financingRequestId")
    List<FinancingRequestItem> findByInvoiceIdAndFinancingRequestIdNot(@Param("invoiceId") Long invoiceId, @Param("financingRequestId") Long financingRequestId);

    @Query("SELECT fri FROM FinancingRequestItem fri WHERE fri.invoice.id = :invoiceId")
    List<FinancingRequestItem> findByInvoiceId(@Param("invoiceId") Long invoiceId);
}
