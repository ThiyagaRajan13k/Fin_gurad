package com.finguard.dto;

public class InventoryDto {
    private Long id;
    private Long productId;
    private String productCode;
    private String productName;
    private Integer availableStock;
    private Integer lowStockAlertLevel;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Integer getAvailableStock() { return availableStock; }
    public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }
    public Integer getLowStockAlertLevel() { return lowStockAlertLevel; }
    public void setLowStockAlertLevel(Integer lowStockAlertLevel) { this.lowStockAlertLevel = lowStockAlertLevel; }
}
