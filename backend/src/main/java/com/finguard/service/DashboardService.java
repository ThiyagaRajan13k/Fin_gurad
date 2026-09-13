package com.finguard.service;

import com.finguard.dto.dashboard.*;
import com.finguard.entity.*;
import com.finguard.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired private UserRepository userRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private SalesOrderRepository salesOrderRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private FinancingRequestRepository financingRequestRepository;
    @Autowired private FraudReportRepository fraudReportRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private ShipmentRepository shipmentRepository;

    public AdminDashboardDto getAdminDashboard() {
        AdminDashboardDto dto = new AdminDashboardDto();
        long totalUsers = userRepository.count();
        dto.setTotalUsers(totalUsers);
        dto.setActiveUsers(totalUsers); // Since we don't have an 'active' flag yet
        dto.setSystemHealth("Healthy");
        dto.setTotalCustomers(customerRepository.count());
        dto.setTotalProducts(productRepository.count());
        dto.setTotalSalesOrders(salesOrderRepository.count());
        dto.setTotalInvoices(invoiceRepository.count());
        dto.setTotalFinancingRequests(financingRequestRepository.count());
        dto.setTotalFraudCases(fraudReportRepository.count());
        
        BigDecimal totalApproved = BigDecimal.ZERO;
        List<FinancingRequest> approvedRequests = financingRequestRepository.findAll().stream()
                .filter(r -> r.getStatus() == FinancingStatus.APPROVED || r.getStatus() == FinancingStatus.DISBURSED)
                .toList();
        for (FinancingRequest req : approvedRequests) {
            if (req.getTotalAmountApproved() != null) {
                totalApproved = totalApproved.add(req.getTotalAmountApproved());
            }
        }
        dto.setTotalApprovedFinancing(totalApproved);
        
        // Mock recent activities
        List<RecentActivityDto> activities = new ArrayList<>();
        activities.add(new RecentActivityDto("1", "User Login", "Admin user logged in", LocalDateTime.now()));
        activities.add(new RecentActivityDto("2", "System Backup", "Automated system backup completed", LocalDateTime.now().minusHours(2)));
        dto.setRecentActivities(activities);
        
        return dto;
    }

    public SupplierDashboardDto getSupplierDashboard() {
        SupplierDashboardDto dto = new SupplierDashboardDto();
        dto.setTotalCustomers(customerRepository.count());
        dto.setTotalProducts(productRepository.count());
        
        long available = 0;
        long lowStock = 0;
        for (Inventory inv : inventoryRepository.findAll()) {
            available += inv.getAvailableStock();
            if (inv.getAvailableStock() < inv.getLowStockAlertLevel()) {
                lowStock++;
            }
        }
        dto.setAvailableInventory(available);
        dto.setLowStockProducts(lowStock);
        
        long pendingOrders = salesOrderRepository.findAll().stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        dto.setPendingSalesOrders(pendingOrders);
        
        long activeShipments = shipmentRepository.findAll().stream().filter(s -> s.getStatus() != ShipmentStatus.DELIVERED && s.getStatus() != ShipmentStatus.RETURNED).count();
        dto.setActiveShipments(activeShipments);
        
        dto.setGeneratedInvoices(invoiceRepository.count());
        dto.setPendingFinancingRequests(financingRequestRepository.findAll().stream().filter(r -> r.getStatus() == FinancingStatus.PENDING).count());
        
        List<RecentActivityDto> activities = new ArrayList<>();
        activities.add(new RecentActivityDto("1", "Order Received", "New sales order received", LocalDateTime.now()));
        dto.setRecentActivities(activities);
        
        return dto;
    }

    public FraudAnalystDashboardDto getFraudAnalystDashboard() {
        FraudAnalystDashboardDto dto = new FraudAnalystDashboardDto();
        
        List<FraudReport> reports = fraudReportRepository.findAll();
        
        long pending = reports.stream().filter(r -> r.getAnalystDecision() == FraudStatus.PENDING_REVIEW).count();
        long highRisk = reports.stream().filter(r -> "HIGH_RISK".equals(r.getSystemRecommendation())).count();
        long mediumRisk = reports.stream().filter(r -> "SUSPICIOUS".equals(r.getSystemRecommendation())).count();
        long safe = reports.stream().filter(r -> "SAFE".equals(r.getSystemRecommendation())).count();
        
        int totalScore = reports.stream().mapToInt(FraudReport::getFraudScore).sum();
        BigDecimal avg = reports.isEmpty() ? BigDecimal.ZERO : new BigDecimal(totalScore).divide(new BigDecimal(reports.size()), 2, RoundingMode.HALF_UP);
        
        dto.setPendingFraudReviews(pending);
        dto.setHighRiskRequests(highRisk);
        dto.setMediumRiskRequests(mediumRisk);
        dto.setSafeRequests(safe);
        dto.setAverageFraudScore(avg);
        
        Map<String, Long> trend = new HashMap<>();
        trend.put("High Risk", highRisk);
        trend.put("Medium Risk", mediumRisk);
        trend.put("Safe", safe);
        dto.setFraudTrendChart(trend);
        
        List<RecentActivityDto> activities = new ArrayList<>();
        activities.add(new RecentActivityDto("1", "Report Generated", "System generated fraud report for FIN-4001", LocalDateTime.now()));
        dto.setRecentActivities(activities);
        
        return dto;
    }

    public BankDashboardDto getBankDashboard() {
        BankDashboardDto dto = new BankDashboardDto();
        
        List<FinancingRequest> requests = financingRequestRepository.findAll();
        
        long pending = requests.stream().filter(r -> r.getStatus() == FinancingStatus.UNDER_REVIEW).count();
        long approved = requests.stream().filter(r -> r.getStatus() == FinancingStatus.APPROVED || r.getStatus() == FinancingStatus.DISBURSED).count();
        long rejected = requests.stream().filter(r -> r.getStatus() == FinancingStatus.REJECTED).count();
        
        BigDecimal totalDisbursed = BigDecimal.ZERO;
        BigDecimal totalOutstanding = BigDecimal.ZERO;
        BigDecimal totalInterest = BigDecimal.ZERO;
        int countWithInterest = 0;
        
        for (FinancingRequest r : requests) {
            if (r.getStatus() == FinancingStatus.DISBURSED) {
                if (r.getTotalAmountApproved() != null) {
                    totalDisbursed = totalDisbursed.add(r.getTotalAmountApproved());
                    totalOutstanding = totalOutstanding.add(r.getTotalAmountApproved()); // Simplified
                }
            }
            if (r.getInterestRate() != null && r.getStatus() != FinancingStatus.REJECTED) {
                totalInterest = totalInterest.add(r.getInterestRate());
                countWithInterest++;
            }
        }
        
        BigDecimal avgInterest = countWithInterest == 0 ? BigDecimal.ZERO : totalInterest.divide(new BigDecimal(countWithInterest), 2, RoundingMode.HALF_UP);
        
        dto.setPendingApprovals(pending);
        dto.setApprovedRequests(approved);
        dto.setRejectedRequests(rejected);
        dto.setTotalDisbursedAmount(totalDisbursed);
        dto.setOutstandingFinancing(totalOutstanding);
        dto.setAverageInterestRate(avgInterest);
        
        List<RecentActivityDto> activities = new ArrayList<>();
        activities.add(new RecentActivityDto("1", "Request Approved", "Financing request FIN-4001 approved", LocalDateTime.now()));
        dto.setRecentActivities(activities);
        
        return dto;
    }
}
