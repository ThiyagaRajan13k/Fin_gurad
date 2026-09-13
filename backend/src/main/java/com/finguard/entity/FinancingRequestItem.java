package com.finguard.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "financing_request_items")
public class FinancingRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "financing_request_id", nullable = false)
    private FinancingRequest financingRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(nullable = false)
    private BigDecimal amountRequested;

    @Column(nullable = false)
    private BigDecimal amountApproved = BigDecimal.ZERO;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public FinancingRequest getFinancingRequest() { return financingRequest; }
    public void setFinancingRequest(FinancingRequest financingRequest) { this.financingRequest = financingRequest; }

    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }

    public BigDecimal getAmountRequested() { return amountRequested; }
    public void setAmountRequested(BigDecimal amountRequested) { this.amountRequested = amountRequested; }

    public BigDecimal getAmountApproved() { return amountApproved; }
    public void setAmountApproved(BigDecimal amountApproved) { this.amountApproved = amountApproved; }
}
