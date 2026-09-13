package com.finguard.service;

import com.finguard.dto.FraudReportDto;
import com.finguard.entity.*;
import com.finguard.repository.FraudReportRepository;
import com.finguard.repository.FinancingRequestRepository;
import com.finguard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FraudDetectionService {

    @Autowired
    private FraudReportRepository fraudReportRepository;

    @Autowired
    private FinancingRequestRepository financingRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.finguard.repository.ShipmentRepository shipmentRepository;

    @Transactional
    public FraudReport generateReport(FinancingRequest detachedRequest) {
        if (fraudReportRepository.existsByFinancingRequestId(detachedRequest.getId())) {
            return fraudReportRepository.findByFinancingRequestId(detachedRequest.getId()).get();
        }

        FinancingRequest request = financingRequestRepository.findById(detachedRequest.getId()).orElse(detachedRequest);

        FraudReport report = new FraudReport();
        report.setReportNumber("FRD-" + System.currentTimeMillis());
        report.setFinancingRequest(request);

        // Rule-based checks (Mocking actual deep verification for now, but following the flow)
        report.setCustomerVerified(request.getCustomer() != null && request.getCustomer().getGstNumber() != null);
        
        Invoice invoice = null;
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            invoice = request.getItems().get(0).getInvoice();
        }
        
        SalesOrder order = (invoice != null) ? invoice.getSalesOrder() : null;
        
        report.setSalesOrderVerified(order != null && order.getStatus() != OrderStatus.PENDING);
        report.setShipmentVerified(order != null && shipmentRepository.existsBySalesOrderId(order.getId()));
        report.setInvoiceVerified(invoice != null && invoice.getStatus() != InvoiceStatus.DRAFT);
        report.setDuplicateInvoice(false); // Mock false
        report.setDuplicateFinancing(false); // Mock false
        report.setAmountMatched(request.getTotalAmountRequested().compareTo(invoice.getTotalAmount()) <= 0);

        // Calculate score
        int score = 0;
        if (!report.isCustomerVerified()) score += 20;
        if (!report.isSalesOrderVerified()) score += 20;
        if (!report.isShipmentVerified()) score += 15;
        if (!report.isInvoiceVerified()) score += 15;
        if (!report.isAmountMatched()) score += 20;
        if (report.isDuplicateInvoice() || report.isDuplicateFinancing()) score += 50;

        report.setFraudScore(Math.min(score, 100));

        if (score == 0) {
            report.setSystemRecommendation("SAFE");
        } else if (score < 40) {
            report.setSystemRecommendation("SUSPICIOUS");
        } else {
            report.setSystemRecommendation("HIGH_RISK");
        }

        report.setAnalystDecision(FraudStatus.PENDING_REVIEW);
        
        return fraudReportRepository.save(report);
    }

    public List<FraudReportDto> getAllReports() {
        return fraudReportRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public FraudReportDto getReportById(Long id) {
        FraudReport report = fraudReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraud Report not found"));
        return mapToDto(report);
    }

    @Transactional
    public FraudReportDto updateAnalystDecision(Long id, FraudStatus decision, String remarks) {
        FraudReport report = fraudReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fraud Report not found"));
                
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User analyst = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        report.setAnalystDecision(decision);
        report.setAnalystRemarks(remarks);
        report.setAnalyst(analyst);
        
        FraudReport saved = fraudReportRepository.save(report);
        return mapToDto(saved);
    }

    private FraudReportDto mapToDto(FraudReport report) {
        FraudReportDto dto = new FraudReportDto();
        dto.setId(report.getId());
        dto.setReportNumber(report.getReportNumber());
        dto.setFinancingRequestId(report.getFinancingRequest().getId());
        dto.setFinancingRequestNumber(report.getFinancingRequest().getRequestNumber());
        
        dto.setCustomerVerified(report.isCustomerVerified());
        dto.setSalesOrderVerified(report.isSalesOrderVerified());
        dto.setShipmentVerified(report.isShipmentVerified());
        dto.setInvoiceVerified(report.isInvoiceVerified());
        dto.setDuplicateInvoice(report.isDuplicateInvoice());
        dto.setDuplicateFinancing(report.isDuplicateFinancing());
        dto.setAmountMatched(report.isAmountMatched());
        
        dto.setFraudScore(report.getFraudScore());
        dto.setSystemRecommendation(report.getSystemRecommendation());
        dto.setAnalystDecision(report.getAnalystDecision().name());
        dto.setAnalystRemarks(report.getAnalystRemarks());
        
        if (report.getAnalyst() != null) {
            dto.setAnalystId(report.getAnalyst().getId());
            dto.setAnalystName(report.getAnalyst().getFullName());
        }
        
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());
        return dto;
    }
}
