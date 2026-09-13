package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAdminDashboard() {
        return ResponseEntity.ok(new ApiResponse(true, "Admin dashboard retrieved", dashboardService.getAdminDashboard()));
    }

    @GetMapping("/supplier")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse> getSupplierDashboard() {
        return ResponseEntity.ok(new ApiResponse(true, "Supplier dashboard retrieved", dashboardService.getSupplierDashboard()));
    }

    @GetMapping("/fraud-analyst")
    @PreAuthorize("hasAnyRole('ADMIN', 'FRAUD_ANALYST', 'RISK_ANALYST')")
    public ResponseEntity<ApiResponse> getFraudAnalystDashboard() {
        return ResponseEntity.ok(new ApiResponse(true, "Fraud analyst dashboard retrieved", dashboardService.getFraudAnalystDashboard()));
    }

    @GetMapping("/bank")
    @PreAuthorize("hasAnyRole('ADMIN', 'BANK_OFFICER')")
    public ResponseEntity<ApiResponse> getBankDashboard() {
        return ResponseEntity.ok(new ApiResponse(true, "Bank dashboard retrieved", dashboardService.getBankDashboard()));
    }
}
