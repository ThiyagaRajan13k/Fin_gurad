package com.finguard.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class FraudAnalystDashboardDto {
    private long pendingFraudReviews;
    private long highRiskRequests;
    private long mediumRiskRequests;
    private long safeRequests;
    private BigDecimal averageFraudScore;
    private Map<String, Long> fraudTrendChart;
    private List<RecentActivityDto> recentActivities;

    public long getPendingFraudReviews() { return pendingFraudReviews; }
    public void setPendingFraudReviews(long pendingFraudReviews) { this.pendingFraudReviews = pendingFraudReviews; }

    public long getHighRiskRequests() { return highRiskRequests; }
    public void setHighRiskRequests(long highRiskRequests) { this.highRiskRequests = highRiskRequests; }

    public long getMediumRiskRequests() { return mediumRiskRequests; }
    public void setMediumRiskRequests(long mediumRiskRequests) { this.mediumRiskRequests = mediumRiskRequests; }

    public long getSafeRequests() { return safeRequests; }
    public void setSafeRequests(long safeRequests) { this.safeRequests = safeRequests; }

    public BigDecimal getAverageFraudScore() { return averageFraudScore; }
    public void setAverageFraudScore(BigDecimal averageFraudScore) { this.averageFraudScore = averageFraudScore; }

    public Map<String, Long> getFraudTrendChart() { return fraudTrendChart; }
    public void setFraudTrendChart(Map<String, Long> fraudTrendChart) { this.fraudTrendChart = fraudTrendChart; }

    public List<RecentActivityDto> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivityDto> recentActivities) { this.recentActivities = recentActivities; }
}
