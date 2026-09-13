package com.finguard.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class FinancingRequestDto {
    private Long id;
    private String requestNumber;
    private Long customerId;
    private String customerName;
    private String status;
    private BigDecimal totalAmountRequested;
    private BigDecimal totalAmountApproved;
    private BigDecimal interestRate;
    private Integer tenureDays;
    private LocalDateTime expectedDisbursementDate;
    private LocalDateTime actualDisbursementDate;
    private String remarks;
    private List<FinancingRequestItemDto> items;
    private String riskAssessment;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getTotalAmountRequested() { return totalAmountRequested; }
    public void setTotalAmountRequested(BigDecimal totalAmountRequested) { this.totalAmountRequested = totalAmountRequested; }

    public BigDecimal getTotalAmountApproved() { return totalAmountApproved; }
    public void setTotalAmountApproved(BigDecimal totalAmountApproved) { this.totalAmountApproved = totalAmountApproved; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }

    public Integer getTenureDays() { return tenureDays; }
    public void setTenureDays(Integer tenureDays) { this.tenureDays = tenureDays; }

    public LocalDateTime getExpectedDisbursementDate() { return expectedDisbursementDate; }
    public void setExpectedDisbursementDate(LocalDateTime expectedDisbursementDate) { this.expectedDisbursementDate = expectedDisbursementDate; }

    public LocalDateTime getActualDisbursementDate() { return actualDisbursementDate; }
    public void setActualDisbursementDate(LocalDateTime actualDisbursementDate) { this.actualDisbursementDate = actualDisbursementDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public List<FinancingRequestItemDto> getItems() { return items; }
    public void setItems(List<FinancingRequestItemDto> items) { this.items = items; }

    public String getRiskAssessment() { return riskAssessment; }
    public void setRiskAssessment(String riskAssessment) { this.riskAssessment = riskAssessment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
