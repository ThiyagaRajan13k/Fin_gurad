package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.dto.ShipmentDto;
import com.finguard.entity.ShipmentStatus;
import com.finguard.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    @Autowired
    private ShipmentService shipmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse> getAllShipments() {
        List<ShipmentDto> shipments = shipmentService.getAllShipments();
        return ResponseEntity.ok(new ApiResponse(true, "Shipments retrieved successfully", shipments));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse> getShipmentById(@PathVariable Long id) {
        ShipmentDto shipment = shipmentService.getShipmentById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Shipment retrieved successfully", shipment));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse> createShipment(@RequestBody ShipmentDto dto) {
        ShipmentDto createdShipment = shipmentService.createShipment(dto);
        return ResponseEntity.ok(new ApiResponse(true, "Shipment created successfully", createdShipment));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse> updateShipmentStatus(@PathVariable Long id, @RequestParam ShipmentStatus status) {
        ShipmentDto updatedShipment = shipmentService.updateShipmentStatus(id, status);
        return ResponseEntity.ok(new ApiResponse(true, "Shipment status updated successfully", updatedShipment));
    }
}
