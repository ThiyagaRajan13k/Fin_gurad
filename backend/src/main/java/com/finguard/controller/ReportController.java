package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.entity.*;
import com.finguard.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private SalesOrderRepository salesOrderRepository;
    @Autowired private ShipmentRepository shipmentRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private FinancingRequestRepository financingRequestRepository;
    @Autowired private FraudReportRepository fraudReportRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'BANK_OFFICER')")
    public ResponseEntity<ApiResponse> getAdminReportsData() {
        Map<String, Object> reportsData = new HashMap<>();
        
        // We'll return counts and top 10 recent items for the report generation view
        reportsData.put("userActivity", auditLogRepository.findTop50ByOrderByDateTimeDesc());
        
        reportsData.put("customers", customerRepository.findAll().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("customerName", c.getName());
            map.put("email", c.getContactNumber());
            map.put("status", "Active");
            return map;
        }).toList());

        reportsData.put("products", productRepository.findAll().stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("name", p.getName());
            map.put("category", p.getCategory() != null ? p.getCategory().getName() : "N/A");
            map.put("price", p.getPrice());
            return map;
        }).toList());

        reportsData.put("inventory", inventoryRepository.findAll().stream().map(i -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", i.getId());
            map.put("productName", i.getProduct() != null ? i.getProduct().getName() : "N/A");
            map.put("quantity", i.getAvailableStock());
            map.put("status", i.getAvailableStock() > 10 ? "In Stock" : "Low Stock");
            return map;
        }).toList());

        reportsData.put("salesOrders", salesOrderRepository.findAll().stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("orderNumber", s.getOrderNumber());
            map.put("customerName", s.getCustomer() != null ? s.getCustomer().getName() : "N/A");
            map.put("status", s.getStatus().toString());
            return map;
        }).toList());

        reportsData.put("financingRequests", financingRequestRepository.findAll().stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("requestNumber", f.getRequestNumber());
            map.put("amount", f.getTotalAmountRequested());
            map.put("status", f.getStatus().toString());
            return map;
        }).toList());
        
        return ResponseEntity.ok(new ApiResponse(true, "Report data retrieved", reportsData));
    }
}
