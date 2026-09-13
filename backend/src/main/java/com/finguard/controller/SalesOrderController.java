package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.dto.SalesOrderDto;
import com.finguard.entity.OrderStatus;
import com.finguard.service.SalesOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
public class SalesOrderController {

    @Autowired
    private SalesOrderService salesOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse> getAllOrders() {
        List<SalesOrderDto> orders = salesOrderService.getAllOrders();
        return ResponseEntity.ok(new ApiResponse(true, "Sales orders retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse> getOrderById(@PathVariable Long id) {
        SalesOrderDto order = salesOrderService.getOrderById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Sales order retrieved successfully", order));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse> createOrder(@RequestBody SalesOrderDto orderDto) {
        SalesOrderDto createdOrder = salesOrderService.createOrder(orderDto);
        return ResponseEntity.ok(new ApiResponse(true, "Sales order created successfully", createdOrder));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        SalesOrderDto updatedOrder = salesOrderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(new ApiResponse(true, "Sales order status updated successfully", updatedOrder));
    }
}
