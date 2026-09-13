package com.finguard.service;

import com.finguard.dto.InvoiceDto;
import com.finguard.dto.InvoiceItemDto;
import com.finguard.entity.*;
import com.finguard.repository.CustomerRepository;
import com.finguard.repository.InvoiceRepository;
import com.finguard.repository.SalesOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    public List<InvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public InvoiceDto getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return mapToDto(invoice);
    }

    @Transactional
    public InvoiceDto createInvoiceFromOrder(Long orderId) {
        SalesOrder order = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot create invoice for an unconfirmed or cancelled order.");
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setCustomer(order.getCustomer());
        invoice.setSalesOrder(order);
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30)); // default 30 days
        
        invoice.setSubTotal(order.getTotalAmount().subtract(order.getTotalTax()).add(order.getDiscount()));
        invoice.setTaxAmount(order.getTotalTax());
        invoice.setDiscount(order.getDiscount());
        invoice.setTotalAmount(order.getTotalAmount());
        
        for (SalesOrderItem orderItem : order.getItems()) {
            InvoiceItem invoiceItem = new InvoiceItem();
            invoiceItem.setProduct(orderItem.getProduct());
            invoiceItem.setQuantity(orderItem.getQuantity());
            invoiceItem.setUnitPrice(orderItem.getUnitPrice());
            invoiceItem.setSubTotal(orderItem.getSubTotal());
            invoiceItem.setTaxAmount(orderItem.getTaxAmount());
            invoice.addItem(invoiceItem);
        }

        return mapToDto(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceDto updateInvoiceStatus(Long id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        invoice.setStatus(status);
        return mapToDto(invoiceRepository.save(invoice));
    }

    private InvoiceDto mapToDto(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setCustomerId(invoice.getCustomer().getId());
        dto.setCustomerName(invoice.getCustomer().getName());
        dto.setSalesOrderId(invoice.getSalesOrder().getId());
        dto.setSalesOrderNumber(invoice.getSalesOrder().getOrderNumber());
        dto.setStatus(invoice.getStatus().name());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setSubTotal(invoice.getSubTotal());
        dto.setTaxAmount(invoice.getTaxAmount());
        dto.setDiscount(invoice.getDiscount());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setAmountPaid(invoice.getAmountPaid());
        dto.setRemarks(invoice.getRemarks());
        dto.setCreatedAt(invoice.getCreatedAt());

        if (invoice.getItems() != null) {
            dto.setItems(invoice.getItems().stream().map(item -> {
                InvoiceItemDto itemDto = new InvoiceItemDto();
                itemDto.setId(item.getId());
                itemDto.setProductId(item.getProduct().getId());
                itemDto.setProductName(item.getProduct().getName());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setSubTotal(item.getSubTotal());
                itemDto.setTaxAmount(item.getTaxAmount());
                return itemDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
