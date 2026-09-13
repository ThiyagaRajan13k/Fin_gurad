package com.finguard.dto.dashboard;

import java.util.List;

public class SupplierDashboardDto {
    private long totalCustomers;
    private long totalProducts;
    private long availableInventory;
    private long lowStockProducts;
    private long pendingSalesOrders;
    private long activeShipments;
    private long generatedInvoices;
    private long pendingFinancingRequests;
    private List<RecentActivityDto> recentActivities;

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getAvailableInventory() { return availableInventory; }
    public void setAvailableInventory(long availableInventory) { this.availableInventory = availableInventory; }

    public long getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(long lowStockProducts) { this.lowStockProducts = lowStockProducts; }

    public long getPendingSalesOrders() { return pendingSalesOrders; }
    public void setPendingSalesOrders(long pendingSalesOrders) { this.pendingSalesOrders = pendingSalesOrders; }

    public long getActiveShipments() { return activeShipments; }
    public void setActiveShipments(long activeShipments) { this.activeShipments = activeShipments; }

    public long getGeneratedInvoices() { return generatedInvoices; }
    public void setGeneratedInvoices(long generatedInvoices) { this.generatedInvoices = generatedInvoices; }

    public long getPendingFinancingRequests() { return pendingFinancingRequests; }
    public void setPendingFinancingRequests(long pendingFinancingRequests) { this.pendingFinancingRequests = pendingFinancingRequests; }

    public List<RecentActivityDto> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivityDto> recentActivities) { this.recentActivities = recentActivities; }
}
