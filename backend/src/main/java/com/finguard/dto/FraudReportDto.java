package com.finguard.dto;

import java.time.LocalDateTime;

public class FraudReportDto {

    private Long id;
    private String reportNumber;
    private Long financingRequestId;
    private String financingRequestNumber;
    
    private boolean customerVerified;
    private boolean salesOrderVerified;
    private boolean shipmentVerified;
    private boolean invoiceVerified;
    private boolean duplicateInvoice;
    private boolean duplicateFinancing;
    private boolean amountMatched;

    private String bankAccount;
    private String bankName;
    private String invoiceNumber;
    private boolean crossBankAttempt;
    private String flaggedReason;
    private String customerName;
    
    private Integer fraudScore;
    private String systemRecommendation;
    private String analystDecision;
    private String analystRemarks;
    
    private Long analystId;
    private String analystName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReportNumber() { return reportNumber; }
    public void setReportNumber(String reportNumber) { this.reportNumber = reportNumber; }

    public Long getFinancingRequestId() { return financingRequestId; }
    public void setFinancingRequestId(Long financingRequestId) { this.financingRequestId = financingRequestId; }

    public String getFinancingRequestNumber() { return financingRequestNumber; }
    public void setFinancingRequestNumber(String financingRequestNumber) { this.financingRequestNumber = financingRequestNumber; }

    public boolean isCustomerVerified() { return customerVerified; }
    public void setCustomerVerified(boolean customerVerified) { this.customerVerified = customerVerified; }

    public boolean isSalesOrderVerified() { return salesOrderVerified; }
    public void setSalesOrderVerified(boolean salesOrderVerified) { this.salesOrderVerified = salesOrderVerified; }

    public boolean isShipmentVerified() { return shipmentVerified; }
    public void setShipmentVerified(boolean shipmentVerified) { this.shipmentVerified = shipmentVerified; }

    public boolean isInvoiceVerified() { return invoiceVerified; }
    public void setInvoiceVerified(boolean invoiceVerified) { this.invoiceVerified = invoiceVerified; }

    public boolean isDuplicateInvoice() { return duplicateInvoice; }
    public void setDuplicateInvoice(boolean duplicateInvoice) { this.duplicateInvoice = duplicateInvoice; }

    public boolean isDuplicateFinancing() { return duplicateFinancing; }
    public void setDuplicateFinancing(boolean duplicateFinancing) { this.duplicateFinancing = duplicateFinancing; }

    public boolean isAmountMatched() { return amountMatched; }
    public void setAmountMatched(boolean amountMatched) { this.amountMatched = amountMatched; }

    public Integer getFraudScore() { return fraudScore; }
    public void setFraudScore(Integer fraudScore) { this.fraudScore = fraudScore; }

    public String getSystemRecommendation() { return systemRecommendation; }
    public void setSystemRecommendation(String systemRecommendation) { this.systemRecommendation = systemRecommendation; }

    public String getAnalystDecision() { return analystDecision; }
    public void setAnalystDecision(String analystDecision) { this.analystDecision = analystDecision; }

    public String getAnalystRemarks() { return analystRemarks; }
    public void setAnalystRemarks(String analystRemarks) { this.analystRemarks = analystRemarks; }

    public Long getAnalystId() { return analystId; }
    public void setAnalystId(Long analystId) { this.analystId = analystId; }

    public String getAnalystName() { return analystName; }
    public void setAnalystName(String analystName) { this.analystName = analystName; }

    public String getBankAccount() { return bankAccount; }
    public void setBankAccount(String bankAccount) { this.bankAccount = bankAccount; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public boolean isCrossBankAttempt() { return crossBankAttempt; }
    public void setCrossBankAttempt(boolean crossBankAttempt) { this.crossBankAttempt = crossBankAttempt; }

    public String getFlaggedReason() { return flaggedReason; }
    public void setFlaggedReason(String flaggedReason) { this.flaggedReason = flaggedReason; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
