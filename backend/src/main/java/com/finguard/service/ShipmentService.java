package com.finguard.service;

import com.finguard.dto.ShipmentDto;
import com.finguard.entity.OrderStatus;
import com.finguard.entity.SalesOrder;
import com.finguard.entity.Shipment;
import com.finguard.entity.ShipmentStatus;
import com.finguard.repository.SalesOrderRepository;
import com.finguard.repository.ShipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private InvoiceService invoiceService;

    public List<ShipmentDto> getAllShipments() {
        return shipmentRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ShipmentDto getShipmentById(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
        return mapToDto(shipment);
    }

    @Transactional
    public ShipmentDto createShipment(ShipmentDto dto) {
        SalesOrder order = salesOrderRepository.findById(dto.getSalesOrderId())
                .orElseThrow(() -> new RuntimeException("Sales order not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot ship cancelled order");
        }

        Shipment shipment = new Shipment();
        shipment.setShipmentNumber(dto.getShipmentNumber() != null ? dto.getShipmentNumber() : "SHP-" + System.currentTimeMillis());
        shipment.setSalesOrder(order);
        shipment.setStatus(ShipmentStatus.CREATED);
        shipment.setCarrierName(dto.getCarrierName() != null ? dto.getCarrierName() : "TBD");
        shipment.setTrackingNumber(dto.getTrackingNumber() != null ? dto.getTrackingNumber() : "TRK-" + System.currentTimeMillis());
        shipment.setVehicleNumber(dto.getVehicleNumber());
        shipment.setDriverName(dto.getDriverName());
        shipment.setDriverPhone(dto.getDriverPhone());
        shipment.setDispatchDate(dto.getDispatchDate());
        shipment.setEstimatedDelivery(dto.getEstimatedDelivery() != null ? dto.getEstimatedDelivery() : LocalDateTime.now().plusDays(3));
        shipment.setRemarks(dto.getRemarks());

        Shipment savedShipment = shipmentRepository.save(shipment);

        // Update Sales Order Status to SHIPPED if dispatched? Wait, the user said they wanted new shipment statuses.
        // If shipment is CREATED, maybe leave sales order CONFIRMED.
        // Let's not automatically change it to SHIPPED here unless it's DISPATCHED.

        return mapToDto(savedShipment);
    }

    @Transactional
    public ShipmentDto updateShipmentStatus(Long id, ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
        
        shipment.setStatus(status);
        if (status == ShipmentStatus.DISPATCHED && shipment.getDispatchDate() == null) {
            shipment.setDispatchDate(LocalDateTime.now());
            SalesOrder order = shipment.getSalesOrder();
            order.setStatus(OrderStatus.SHIPPED);
            salesOrderRepository.save(order);
            
            // Auto generate invoice when shipment is dispatched (approved)
            invoiceService.createInvoiceFromOrder(order.getId());
        }
        if (status == ShipmentStatus.DELIVERED) {
            shipment.setActualDelivery(LocalDateTime.now());
            
            SalesOrder order = shipment.getSalesOrder();
            order.setStatus(OrderStatus.DELIVERED);
            salesOrderRepository.save(order);
        }
        if (status == ShipmentStatus.RETURNED) {
            // Treat RETURNED as declined shipment. Cancel the Sales Order.
            SalesOrder order = shipment.getSalesOrder();
            order.setStatus(OrderStatus.CANCELLED);
            salesOrderRepository.save(order);
            // Optionally could add restocking logic here if needed
        }
        
        return mapToDto(shipmentRepository.save(shipment));
    }

    private ShipmentDto mapToDto(Shipment shipment) {
        ShipmentDto dto = new ShipmentDto();
        dto.setId(shipment.getId());
        dto.setShipmentNumber(shipment.getShipmentNumber());
        dto.setSalesOrderId(shipment.getSalesOrder().getId());
        dto.setSalesOrderNumber(shipment.getSalesOrder().getOrderNumber());
        dto.setStatus(shipment.getStatus().name());
        dto.setCarrierName(shipment.getCarrierName());
        dto.setTrackingNumber(shipment.getTrackingNumber());
        dto.setVehicleNumber(shipment.getVehicleNumber());
        dto.setDriverName(shipment.getDriverName());
        dto.setDriverPhone(shipment.getDriverPhone());
        dto.setDispatchDate(shipment.getDispatchDate());
        dto.setEstimatedDelivery(shipment.getEstimatedDelivery());
        dto.setActualDelivery(shipment.getActualDelivery());
        dto.setRemarks(shipment.getRemarks());
        dto.setCreatedAt(shipment.getCreatedAt());
        return dto;
    }
}
