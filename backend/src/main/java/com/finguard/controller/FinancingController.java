package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.dto.FinancingRequestDto;
import com.finguard.entity.FinancingStatus;
import com.finguard.service.FinancingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financing")
public class FinancingController {

    @Autowired
    private FinancingService financingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER', 'BANK_OFFICER', 'RISK_ANALYST')")
    public ResponseEntity<ApiResponse> getAllRequests() {
        List<FinancingRequestDto> requests = financingService.getAllRequests();
        return ResponseEntity.ok(new ApiResponse(true, "Financing requests retrieved successfully", requests));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER', 'BANK_OFFICER', 'RISK_ANALYST')")
    public ResponseEntity<ApiResponse> getRequestById(@PathVariable Long id) {
        FinancingRequestDto request = financingService.getRequestById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Financing request retrieved successfully", request));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse> createRequest(@RequestBody FinancingRequestDto dto) {
        FinancingRequestDto createdRequest = financingService.createRequest(dto);
        return ResponseEntity.ok(new ApiResponse(true, "Financing request created successfully", createdRequest));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'BANK_OFFICER', 'RISK_ANALYST')")
    public ResponseEntity<ApiResponse> updateRequestStatus(@PathVariable Long id, @RequestParam FinancingStatus status) {
        FinancingRequestDto updatedRequest = financingService.updateRequestStatus(id, status);
        return ResponseEntity.ok(new ApiResponse(true, "Financing request status updated successfully", updatedRequest));
    }
}
