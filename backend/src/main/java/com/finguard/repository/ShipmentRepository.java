package com.finguard.repository;

import com.finguard.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    boolean existsBySalesOrderId(Long salesOrderId);
}
