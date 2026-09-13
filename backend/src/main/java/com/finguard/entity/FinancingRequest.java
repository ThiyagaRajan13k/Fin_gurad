package com.finguard.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "financing_requests")
public class FinancingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FinancingStatus status = FinancingStatus.PENDING;

    @Column(nullable = false)
    private BigDecimal totalAmountRequested = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal totalAmountApproved = BigDecimal.ZERO;

    private BigDecimal interestRate;
    private Integer tenureDays;
    private LocalDateTime expectedDisbursementDate;
    private LocalDateTime actualDisbursementDate;
    
    @Column(length = 500)
    private String remarks;

    @OneToMany(mappedBy = "financingRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FinancingRequestItem> items = new ArrayList<>();

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

    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public FinancingStatus getStatus() { return status; }
    public void setStatus(FinancingStatus status) { this.status = status; }

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

    public List<FinancingRequestItem> getItems() { return items; }
    public void setItems(List<FinancingRequestItem> items) { this.items = items; }

    public void addItem(FinancingRequestItem item) {
        items.add(item);
        item.setFinancingRequest(this);
    }

    public void removeItem(FinancingRequestItem item) {
        items.remove(item);
        item.setFinancingRequest(null);
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
