package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.dto.BankApprovalDto;
import com.finguard.entity.BankApprovalStatus;
import com.finguard.service.BankApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bank-approvals")
public class BankApprovalController {

    @Autowired
    private BankApprovalService bankApprovalService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BANK_OFFICER', 'RISK_ANALYST')")
    public ResponseEntity<ApiResponse> getAllApprovals() {
        List<BankApprovalDto> approvals = bankApprovalService.getAllApprovals();
        return ResponseEntity.ok(new ApiResponse(true, "Bank approvals retrieved successfully", approvals));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BANK_OFFICER', 'RISK_ANALYST')")
    public ResponseEntity<ApiResponse> getApprovalById(@PathVariable Long id) {
        BankApprovalDto approval = bankApprovalService.getApprovalById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Bank approval retrieved successfully", approval));
    }

    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'BANK_OFFICER')")
    public ResponseEntity<ApiResponse> processApproval(
            @RequestParam Long financingRequestId,
            @RequestParam BigDecimal approvedAmount,
            @RequestParam BigDecimal interestRate,
            @RequestParam BigDecimal processingFee,
            @RequestParam BankApprovalStatus status,
            @RequestParam String remarks) {
        BankApprovalDto approval = bankApprovalService.processApproval(financingRequestId, approvedAmount, interestRate, processingFee, status, remarks);
        return ResponseEntity.ok(new ApiResponse(true, "Bank approval processed successfully", approval));
    }
}
