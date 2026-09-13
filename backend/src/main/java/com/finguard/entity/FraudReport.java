package com.finguard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_reports")
public class FraudReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reportNumber;

    @OneToOne
    @JoinColumn(name = "financing_request_id", nullable = false)
    private FinancingRequest financingRequest;

    // Rule-based checks
    private boolean customerVerified;
    private boolean salesOrderVerified;
    private boolean shipmentVerified;
    private boolean invoiceVerified;
    private boolean duplicateInvoice;
    private boolean duplicateFinancing;
    private boolean amountMatched;

    private Integer fraudScore;
    private String systemRecommendation; // SAFE, SUSPICIOUS, HIGH_RISK

    @Enumerated(EnumType.STRING)
    private FraudStatus analystDecision = FraudStatus.PENDING_REVIEW;

    @Column(length = 1000)
    private String analystRemarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analyst_id")
    private User analyst;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReportNumber() { return reportNumber; }
    public void setReportNumber(String reportNumber) { this.reportNumber = reportNumber; }

    public FinancingRequest getFinancingRequest() { return financingRequest; }
    public void setFinancingRequest(FinancingRequest financingRequest) { this.financingRequest = financingRequest; }

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

    public FraudStatus getAnalystDecision() { return analystDecision; }
    public void setAnalystDecision(FraudStatus analystDecision) { this.analystDecision = analystDecision; }

    public String getAnalystRemarks() { return analystRemarks; }
    public void setAnalystRemarks(String analystRemarks) { this.analystRemarks = analystRemarks; }

    public User getAnalyst() { return analyst; }
    public void setAnalyst(User analyst) { this.analyst = analyst; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
