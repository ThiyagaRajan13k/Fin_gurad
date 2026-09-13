package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.dto.FraudReportDto;
import com.finguard.entity.FraudStatus;
import com.finguard.service.FraudDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fraud")
public class FraudDetectionController {

    @Autowired
    private FraudDetectionService fraudDetectionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FRAUD_ANALYST', 'RISK_ANALYST', 'BANK_OFFICER')")
    public ResponseEntity<ApiResponse> getAllReports() {
        List<FraudReportDto> reports = fraudDetectionService.getAllReports();
        return ResponseEntity.ok(new ApiResponse(true, "Fraud reports retrieved successfully", reports));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FRAUD_ANALYST', 'RISK_ANALYST', 'BANK_OFFICER')")
    public ResponseEntity<ApiResponse> getReportById(@PathVariable Long id) {
        FraudReportDto report = fraudDetectionService.getReportById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Fraud report retrieved successfully", report));
    }

    @PutMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'FRAUD_ANALYST', 'RISK_ANALYST')")
    public ResponseEntity<ApiResponse> updateDecision(
            @PathVariable Long id, 
            @RequestParam FraudStatus decision, 
            @RequestParam String remarks) {
        FraudReportDto updatedReport = fraudDetectionService.updateAnalystDecision(id, decision, remarks);
        return ResponseEntity.ok(new ApiResponse(true, "Fraud decision updated successfully", updatedReport));
    }
}
