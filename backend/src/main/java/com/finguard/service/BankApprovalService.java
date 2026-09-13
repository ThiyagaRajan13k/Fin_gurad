package com.finguard.service;

import com.finguard.dto.BankApprovalDto;
import com.finguard.entity.*;
import com.finguard.repository.BankApprovalRepository;
import com.finguard.repository.FinancingRequestRepository;
import com.finguard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BankApprovalService {

    @Autowired
    private BankApprovalRepository bankApprovalRepository;

    @Autowired
    private FinancingRequestRepository financingRequestRepository;

    @Autowired
    private UserRepository userRepository;

    public List<BankApprovalDto> getAllApprovals() {
        return bankApprovalRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public BankApprovalDto getApprovalById(Long id) {
        BankApproval approval = bankApprovalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bank Approval not found"));
        return mapToDto(approval);
    }

    @Transactional
    public BankApprovalDto processApproval(Long financingRequestId, BigDecimal approvedAmount, BigDecimal interestRate, BigDecimal processingFee, BankApprovalStatus status, String remarks) {
        FinancingRequest request = financingRequestRepository.findById(financingRequestId)
                .orElseThrow(() -> new RuntimeException("Financing Request not found"));

        BankApproval approval = bankApprovalRepository.findByFinancingRequestId(financingRequestId)
                .orElse(new BankApproval());

        if (approval.getId() == null) {
            approval.setApprovalNumber("BA-" + System.currentTimeMillis());
            approval.setFinancingRequest(request);
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User officer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        approval.setApprovedAmount(approvedAmount);
        approval.setInterestRate(interestRate);
        approval.setProcessingFee(processingFee);
        approval.setStatus(status);
        approval.setRemarks(remarks);
        approval.setOfficer(officer);
        approval.setApprovalDate(LocalDateTime.now());
        
        if (status == BankApprovalStatus.DISBURSED) {
            approval.setDisbursementDate(LocalDateTime.now());
            request.setStatus(FinancingStatus.DISBURSED);
            request.setTotalAmountApproved(approvedAmount);
        } else if (status == BankApprovalStatus.APPROVED) {
            request.setStatus(FinancingStatus.APPROVED);
            request.setTotalAmountApproved(approvedAmount);
        } else if (status == BankApprovalStatus.REJECTED) {
            request.setStatus(FinancingStatus.REJECTED);
        }

        financingRequestRepository.save(request);
        BankApproval saved = bankApprovalRepository.save(approval);
        
        return mapToDto(saved);
    }

    private BankApprovalDto mapToDto(BankApproval approval) {
        BankApprovalDto dto = new BankApprovalDto();
        dto.setId(approval.getId());
        dto.setApprovalNumber(approval.getApprovalNumber());
        dto.setFinancingRequestId(approval.getFinancingRequest().getId());
        dto.setFinancingRequestNumber(approval.getFinancingRequest().getRequestNumber());
        
        dto.setApprovedAmount(approval.getApprovedAmount());
        dto.setInterestRate(approval.getInterestRate());
        dto.setProcessingFee(approval.getProcessingFee());
        dto.setApprovalDate(approval.getApprovalDate());
        dto.setDisbursementDate(approval.getDisbursementDate());
        dto.setRemarks(approval.getRemarks());
        dto.setStatus(approval.getStatus().name());
        
        if (approval.getOfficer() != null) {
            dto.setOfficerId(approval.getOfficer().getId());
            dto.setOfficerName(approval.getOfficer().getFullName());
        }
        
        dto.setCreatedAt(approval.getCreatedAt());
        dto.setUpdatedAt(approval.getUpdatedAt());
        return dto;
    }
}
