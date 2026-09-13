package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.dto.InvoiceDto;
import com.finguard.entity.InvoiceStatus;
import com.finguard.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER', 'BANK_OFFICER')")
    public ResponseEntity<ApiResponse> getAllInvoices() {
        List<InvoiceDto> invoices = invoiceService.getAllInvoices();
        return ResponseEntity.ok(new ApiResponse(true, "Invoices retrieved successfully", invoices));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER', 'BANK_OFFICER')")
    public ResponseEntity<ApiResponse> getInvoiceById(@PathVariable Long id) {
        InvoiceDto invoice = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Invoice retrieved successfully", invoice));
    }

    @PostMapping("/from-order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse> createInvoiceFromOrder(@PathVariable Long orderId) {
        InvoiceDto createdInvoice = invoiceService.createInvoiceFromOrder(orderId);
        return ResponseEntity.ok(new ApiResponse(true, "Invoice created successfully from order", createdInvoice));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPLIER')")
    public ResponseEntity<ApiResponse> updateInvoiceStatus(@PathVariable Long id, @RequestParam InvoiceStatus status) {
        InvoiceDto updatedInvoice = invoiceService.updateInvoiceStatus(id, status);
        return ResponseEntity.ok(new ApiResponse(true, "Invoice status updated successfully", updatedInvoice));
    }
}
