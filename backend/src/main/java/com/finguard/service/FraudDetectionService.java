package com.finguard.service;

import com.finguard.dto.FraudReportDto;
import com.finguard.entity.*;
import com.finguard.repository.FraudReportRepository;
import com.finguard.repository.FinancingRequestRepository;
import com.finguard.repository.FinancingRequestItemRepository;
import com.finguard.repository.InvoiceRepository;
import com.finguard.repository.ShipmentRepository;
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
    private ShipmentRepository shipmentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private FinancingRequestItemRepository financingRequestItemRepository;

    @Transactional
    public FraudReport generateReport(FinancingRequest detachedRequest) {
        if (fraudReportRepository.existsByFinancingRequestId(detachedRequest.getId())) {
            return fraudReportRepository.findByFinancingRequestId(detachedRequest.getId()).get();
        }

        FinancingRequest request = financingRequestRepository.findById(detachedRequest.getId()).orElse(detachedRequest);

        FraudReport report = new FraudReport();
        report.setReportNumber("FRD-" + System.currentTimeMillis());
        report.setFinancingRequest(request);

        // Customer & business document verifications
        report.setCustomerVerified(request.getCustomer() != null && request.getCustomer().getGstNumber() != null);
        
        Invoice invoice = null;
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            invoice = request.getItems().get(0).getInvoice();
        } else if (detachedRequest.getItems() != null && !detachedRequest.getItems().isEmpty()) {
            invoice = detachedRequest.getItems().get(0).getInvoice();
        } else {
            List<FinancingRequestItem> currentItems = financingRequestItemRepository.findByFinancingRequestId(request.getId());
            if (!currentItems.isEmpty()) {
                invoice = currentItems.get(0).getInvoice();
            }
        }
        
        SalesOrder order = (invoice != null) ? invoice.getSalesOrder() : null;
        
        report.setSalesOrderVerified(order != null && order.getStatus() != OrderStatus.PENDING);
        report.setShipmentVerified(order != null && shipmentRepository.existsBySalesOrderId(order.getId()));
        report.setInvoiceVerified(invoice != null && invoice.getStatus() != InvoiceStatus.DRAFT);
        report.setAmountMatched(invoice != null && request.getTotalAmountRequested() != null && request.getTotalAmountRequested().compareTo(invoice.getTotalAmount()) <= 0);

        // Dynamic Duplicate & Cross-Bank Financing Detection
        boolean isDuplicateFinancing = false;
        boolean isDuplicateInvoice = false;
        boolean isCrossBankAttempt = false;
        StringBuilder flaggedReason = new StringBuilder();

        String currentBank = request.getBankAccount() != null ? request.getBankAccount() 
                           : (request.getBankName() != null ? request.getBankName() : "Unknown Bank");

        if (invoice != null) {
            report.setInvoiceNumber(invoice.getInvoiceNumber());

            // Query existing items that referenced this exact same invoice
            List<FinancingRequestItem> priorItems = financingRequestItemRepository.findByInvoiceIdAndFinancingRequestIdNot(invoice.getId(), request.getId());
            
            // Filter only non-rejected prior financing requests
            List<FinancingRequestItem> activePriorItems = priorItems.stream()
                .filter(item -> item.getFinancingRequest() != null && item.getFinancingRequest().getStatus() != FinancingStatus.REJECTED)
                .collect(Collectors.toList());

            if (!activePriorItems.isEmpty()) {
                isDuplicateFinancing = true;

                for (FinancingRequestItem priorItem : activePriorItems) {
                    FinancingRequest priorReq = priorItem.getFinancingRequest();
                    if (priorReq != null) {
                        String priorBank = priorReq.getBankAccount() != null ? priorReq.getBankAccount()
                                         : (priorReq.getBankName() != null ? priorReq.getBankName() : "Primary Account");
                        
                        if (!priorBank.trim().equalsIgnoreCase(currentBank.trim())) {
                            isCrossBankAttempt = true;
                            flaggedReason.append(String.format("Cross-Bank Financing Detected: Invoice %s was previously financed with '%s' (Request %s), and is now re-submitted under bank '%s'. ",
                                invoice.getInvoiceNumber(), priorBank, priorReq.getRequestNumber(), currentBank));
                        } else {
                            flaggedReason.append(String.format("Duplicate Financing Detected: Invoice %s was already financed in Request %s under bank '%s'. ",
                                invoice.getInvoiceNumber(), priorReq.getRequestNumber(), priorBank));
                        }
                    }
                }
            }

            // Multiple invoices sharing same sales order check
            if (order != null && invoiceRepository.findBySalesOrderId(order.getId()).size() > 1) {
                isDuplicateInvoice = true;
                flaggedReason.append("Multiple invoices found for the same sales order. ");
            }
        }

        report.setBankAccount(currentBank);
        report.setBankName(request.getBankName() != null ? request.getBankName() : currentBank);
        report.setDuplicateFinancing(isDuplicateFinancing);
        report.setDuplicateInvoice(isDuplicateInvoice);
        report.setCrossBankAttempt(isCrossBankAttempt);
        report.setFlaggedReason(flaggedReason.toString().trim());

        // Calculate score according to flow diagram:
        // Valid Flow -> Normal (0/100)
        // Duplicate Financing -> +Score (+75)
        // Cross-bank Attempt -> +Score (+85)
        int score = 0;
        if (!report.isCustomerVerified()) score += 20;
        if (!report.isSalesOrderVerified()) score += 20;
        if (!report.isShipmentVerified()) score += 15;
        if (!report.isInvoiceVerified()) score += 15;
        if (!report.isAmountMatched()) score += 20;
        if (report.isDuplicateInvoice()) score += 30;
        
        if (isCrossBankAttempt) {
            score += 85; // High severity penalty for cross-institutional double pledge
        } else if (report.isDuplicateFinancing()) {
            score += 75; // Critical duplicate financing penalty
        }

        report.setFraudScore(Math.min(score, 100));

        if (score == 0) {
            report.setSystemRecommendation("SAFE");
        } else if (score < 40) {
            report.setSystemRecommendation("SUSPICIOUS");
        } else {
            report.setSystemRecommendation("HIGH_RISK");
        }

        // When duplicate financing or cross-bank attempt is detected, auto-flag for the analyst!
        if (isDuplicateFinancing || isCrossBankAttempt) {
            report.setAnalystDecision(FraudStatus.FLAGGED);
            report.setAnalystRemarks("AUTO-FLAGGED BY FRAUD ENGINE: " + report.getFlaggedReason());
        } else {
            report.setAnalystDecision(FraudStatus.PENDING_REVIEW);
        }
        
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

        if (decision == FraudStatus.FLAGGED) {
            report.setSystemRecommendation("HIGH_RISK");
            report.setFraudScore(Math.max(report.getFraudScore() != null ? report.getFraudScore() : 0, 95));
            report.setDuplicateFinancing(true);
            if (report.getFinancingRequest() != null) {
                report.getFinancingRequest().setStatus(FinancingStatus.REJECTED);
            }
        } else if (decision == FraudStatus.CLEARED) {
            report.setSystemRecommendation("SAFE");
            report.setFraudScore(0);
        }
        
        FraudReport saved = fraudReportRepository.save(report);
        return mapToDto(saved);
    }

    private FraudReportDto mapToDto(FraudReport report) {
        FraudReportDto dto = new FraudReportDto();
        dto.setId(report.getId());
        dto.setReportNumber(report.getReportNumber());

        if (report.getFinancingRequest() != null) {
            FinancingRequest req = report.getFinancingRequest();
            dto.setFinancingRequestId(req.getId());
            dto.setFinancingRequestNumber(req.getRequestNumber());
            dto.setBankAccount(req.getBankAccount() != null ? req.getBankAccount() : "Indian Bank •••• 1928");
            dto.setBankName(req.getBankName() != null ? req.getBankName() : "Indian Bank");
            if (req.getCustomer() != null) {
                dto.setCustomerName(req.getCustomer().getName());
            }
            if (req.getItems() != null && !req.getItems().isEmpty() && req.getItems().get(0).getInvoice() != null) {
                dto.setInvoiceNumber(req.getItems().get(0).getInvoice().getInvoiceNumber());
            } else {
                List<FinancingRequestItem> currentItems = financingRequestItemRepository.findByFinancingRequestId(req.getId());
                if (!currentItems.isEmpty() && currentItems.get(0).getInvoice() != null) {
                    dto.setInvoiceNumber(currentItems.get(0).getInvoice().getInvoiceNumber());
                }
            }
        }

        if (dto.getBankAccount() == null) {
            dto.setBankAccount(report.getBankAccount() != null ? report.getBankAccount() : "Indian Bank •••• 1928");
        }
        if (dto.getBankName() == null) {
            dto.setBankName(report.getBankName() != null ? report.getBankName() : "Indian Bank");
        }
        if (dto.getInvoiceNumber() == null) {
            dto.setInvoiceNumber(report.getInvoiceNumber() != null ? report.getInvoiceNumber() : "INV-3001");
        }

        dto.setCrossBankAttempt(report.isCrossBankAttempt());
        dto.setFlaggedReason(report.getFlaggedReason());
        
        dto.setCustomerVerified(report.isCustomerVerified());
        dto.setSalesOrderVerified(report.isSalesOrderVerified());
        dto.setShipmentVerified(report.isShipmentVerified());
        dto.setInvoiceVerified(report.isInvoiceVerified());
        dto.setDuplicateInvoice(report.isDuplicateInvoice());
        dto.setDuplicateFinancing(report.isDuplicateFinancing() || report.getAnalystDecision() == FraudStatus.FLAGGED);
        dto.setAmountMatched(report.isAmountMatched());
        
        // When analyst or engine flagged as fraud, elevate score and set recommendation to HIGH_RISK
        if (report.getAnalystDecision() == FraudStatus.FLAGGED) {
            dto.setFraudScore(Math.max(report.getFraudScore() != null ? report.getFraudScore() : 0, 95));
            dto.setSystemRecommendation("HIGH_RISK");
        } else {
            dto.setFraudScore(report.getFraudScore());
            dto.setSystemRecommendation(report.getSystemRecommendation());
        }

        dto.setAnalystDecision(report.getAnalystDecision() != null ? report.getAnalystDecision().name() : "PENDING_REVIEW");
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
