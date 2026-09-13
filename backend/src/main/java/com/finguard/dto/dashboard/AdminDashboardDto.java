package com.finguard.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public class AdminDashboardDto {
    private long totalUsers;
    private long activeUsers;
    private String systemHealth;
    private long totalCustomers;
    private long totalProducts;
    private long totalSalesOrders;
    private long totalInvoices;
    private long totalFinancingRequests;
    private long totalFraudCases;
    private BigDecimal totalApprovedFinancing;
    private List<RecentActivityDto> recentActivities;

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public String getSystemHealth() { return systemHealth; }
    public void setSystemHealth(String systemHealth) { this.systemHealth = systemHealth; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalSalesOrders() { return totalSalesOrders; }
    public void setTotalSalesOrders(long totalSalesOrders) { this.totalSalesOrders = totalSalesOrders; }

    public long getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(long totalInvoices) { this.totalInvoices = totalInvoices; }

    public long getTotalFinancingRequests() { return totalFinancingRequests; }
    public void setTotalFinancingRequests(long totalFinancingRequests) { this.totalFinancingRequests = totalFinancingRequests; }

    public long getTotalFraudCases() { return totalFraudCases; }
    public void setTotalFraudCases(long totalFraudCases) { this.totalFraudCases = totalFraudCases; }

    public BigDecimal getTotalApprovedFinancing() { return totalApprovedFinancing; }
    public void setTotalApprovedFinancing(BigDecimal totalApprovedFinancing) { this.totalApprovedFinancing = totalApprovedFinancing; }

    public List<RecentActivityDto> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivityDto> recentActivities) { this.recentActivities = recentActivities; }
}
