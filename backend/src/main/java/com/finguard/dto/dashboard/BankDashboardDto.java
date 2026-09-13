package com.finguard.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public class BankDashboardDto {
    private long pendingApprovals;
    private long approvedRequests;
    private long rejectedRequests;
    private BigDecimal totalDisbursedAmount;
    private BigDecimal averageInterestRate;
    private BigDecimal outstandingFinancing;
    private List<RecentActivityDto> recentActivities;

    public long getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(long pendingApprovals) { this.pendingApprovals = pendingApprovals; }

    public long getApprovedRequests() { return approvedRequests; }
    public void setApprovedRequests(long approvedRequests) { this.approvedRequests = approvedRequests; }

    public long getRejectedRequests() { return rejectedRequests; }
    public void setRejectedRequests(long rejectedRequests) { this.rejectedRequests = rejectedRequests; }

    public BigDecimal getTotalDisbursedAmount() { return totalDisbursedAmount; }
    public void setTotalDisbursedAmount(BigDecimal totalDisbursedAmount) { this.totalDisbursedAmount = totalDisbursedAmount; }

    public BigDecimal getAverageInterestRate() { return averageInterestRate; }
    public void setAverageInterestRate(BigDecimal averageInterestRate) { this.averageInterestRate = averageInterestRate; }

    public BigDecimal getOutstandingFinancing() { return outstandingFinancing; }
    public void setOutstandingFinancing(BigDecimal outstandingFinancing) { this.outstandingFinancing = outstandingFinancing; }

    public List<RecentActivityDto> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivityDto> recentActivities) { this.recentActivities = recentActivities; }
}
