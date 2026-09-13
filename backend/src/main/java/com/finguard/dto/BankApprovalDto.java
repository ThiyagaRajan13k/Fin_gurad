package com.finguard.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BankApprovalDto {

    private Long id;
    private String approvalNumber;
    private Long financingRequestId;
    private String financingRequestNumber;
    
    private BigDecimal approvedAmount;
    private BigDecimal interestRate;
    private BigDecimal processingFee;
    
    private LocalDateTime approvalDate;
    private LocalDateTime disbursementDate;
    
    private String remarks;
    private String status;
    
    private Long officerId;
    private String officerName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApprovalNumber() { return approvalNumber; }
    public void setApprovalNumber(String approvalNumber) { this.approvalNumber = approvalNumber; }

    public Long getFinancingRequestId() { return financingRequestId; }
    public void setFinancingRequestId(Long financingRequestId) { this.financingRequestId = financingRequestId; }

    public String getFinancingRequestNumber() { return financingRequestNumber; }
    public void setFinancingRequestNumber(String financingRequestNumber) { this.financingRequestNumber = financingRequestNumber; }

    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }

    public BigDecimal getProcessingFee() { return processingFee; }
    public void setProcessingFee(BigDecimal processingFee) { this.processingFee = processingFee; }

    public LocalDateTime getApprovalDate() { return approvalDate; }
    public void setApprovalDate(LocalDateTime approvalDate) { this.approvalDate = approvalDate; }

    public LocalDateTime getDisbursementDate() { return disbursementDate; }
    public void setDisbursementDate(LocalDateTime disbursementDate) { this.disbursementDate = disbursementDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getOfficerId() { return officerId; }
    public void setOfficerId(Long officerId) { this.officerId = officerId; }

    public String getOfficerName() { return officerName; }
    public void setOfficerName(String officerName) { this.officerName = officerName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
