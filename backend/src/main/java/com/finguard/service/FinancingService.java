package com.finguard.service;

import com.finguard.dto.FinancingRequestDto;
import com.finguard.dto.FinancingRequestItemDto;
import com.finguard.entity.*;
import com.finguard.repository.CustomerRepository;
import com.finguard.repository.FinancingRequestRepository;
import com.finguard.repository.FraudReportRepository;
import com.finguard.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinancingService {

    @Autowired
    private FinancingRequestRepository financingRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FraudDetectionService fraudDetectionService;

    @Autowired
    private FraudReportRepository fraudReportRepository;

    public List<FinancingRequestDto> getAllRequests() {
        return financingRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public FinancingRequestDto getRequestById(Long id) {
        FinancingRequest request = financingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Financing request not found"));
        return mapToDto(request);
    }

    @Transactional
    public FinancingRequestDto createRequest(FinancingRequestDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        FinancingRequest request = new FinancingRequest();
        request.setRequestNumber("FIN-" + System.currentTimeMillis());
        request.setCustomer(customer);
        request.setStatus(FinancingStatus.PENDING);
        request.setTenureDays(dto.getTenureDays() != null ? dto.getTenureDays() : 30);
        request.setRemarks(dto.getRemarks());
        
        BigDecimal totalRequested = BigDecimal.ZERO;

        if (dto.getItems() != null) {
            for (FinancingRequestItemDto itemDto : dto.getItems()) {
                Invoice invoice = invoiceRepository.findById(itemDto.getInvoiceId())
                        .orElseThrow(() -> new RuntimeException("Invoice not found"));

                if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.CANCELLED) {
                    throw new RuntimeException("Cannot finance a paid or cancelled invoice");
                }

                FinancingRequestItem requestItem = new FinancingRequestItem();
                requestItem.setInvoice(invoice);
                requestItem.setAmountRequested(itemDto.getAmountRequested() != null ? itemDto.getAmountRequested() : invoice.getTotalAmount());
                
                totalRequested = totalRequested.add(requestItem.getAmountRequested());
                request.addItem(requestItem);
            }
        }

        request.setTotalAmountRequested(totalRequested);
        FinancingRequest saved = financingRepository.save(request);
        fraudDetectionService.generateReport(saved);
        return mapToDto(saved);
    }

    @Transactional
    public FinancingRequestDto updateRequestStatus(Long id, FinancingStatus status) {
        FinancingRequest request = financingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Financing request not found"));
        
        request.setStatus(status);
        return mapToDto(financingRepository.save(request));
    }

    private FinancingRequestDto mapToDto(FinancingRequest request) {
        FinancingRequestDto dto = new FinancingRequestDto();
        dto.setId(request.getId());
        dto.setRequestNumber(request.getRequestNumber());
        dto.setCustomerId(request.getCustomer().getId());
        dto.setCustomerName(request.getCustomer().getName());
        dto.setStatus(request.getStatus().name());
        dto.setTotalAmountRequested(request.getTotalAmountRequested());
        dto.setTotalAmountApproved(request.getTotalAmountApproved());
        dto.setInterestRate(request.getInterestRate());
        dto.setTenureDays(request.getTenureDays());
        dto.setExpectedDisbursementDate(request.getExpectedDisbursementDate());
        dto.setActualDisbursementDate(request.getActualDisbursementDate());
        dto.setRemarks(request.getRemarks());
        dto.setCreatedAt(request.getCreatedAt());

        java.util.Optional<FraudReport> fraudReportOpt = fraudReportRepository.findByFinancingRequestId(request.getId());
        if (fraudReportOpt.isPresent()) {
            FraudStatus analystDecision = fraudReportOpt.get().getAnalystDecision();
            if (analystDecision == FraudStatus.CLEARED) {
                dto.setRiskAssessment("Safe");
            } else if (analystDecision == FraudStatus.FLAGGED) {
                dto.setRiskAssessment("Risk");
            } else {
                dto.setRiskAssessment("Pending");
            }
        } else {
            dto.setRiskAssessment("Pending");
        }

        if (request.getItems() != null) {
            dto.setItems(request.getItems().stream().map(item -> {
                FinancingRequestItemDto itemDto = new FinancingRequestItemDto();
                itemDto.setId(item.getId());
                itemDto.setInvoiceId(item.getInvoice().getId());
                itemDto.setInvoiceNumber(item.getInvoice().getInvoiceNumber());
                itemDto.setAmountRequested(item.getAmountRequested());
                itemDto.setAmountApproved(item.getAmountApproved());
                return itemDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
