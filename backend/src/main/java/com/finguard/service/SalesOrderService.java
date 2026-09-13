package com.finguard.service;

import com.finguard.dto.SalesOrderDto;
import com.finguard.dto.SalesOrderItemDto;
import com.finguard.entity.*;
import com.finguard.repository.CustomerRepository;
import com.finguard.repository.InventoryRepository;
import com.finguard.repository.ProductRepository;
import com.finguard.repository.SalesOrderRepository;
import com.finguard.dto.ShipmentDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesOrderService {

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private ShipmentService shipmentService;

    public List<SalesOrderDto> getAllOrders() {
        return salesOrderRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SalesOrderDto getOrderById(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToDto(order);
    }

    @Transactional
    public SalesOrderDto createOrder(SalesOrderDto orderDto) {
        Customer customer = customerRepository.findById(orderDto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        SalesOrder order = new SalesOrder();
        order.setOrderNumber(orderDto.getOrderNumber() != null ? orderDto.getOrderNumber() : "SO-" + System.currentTimeMillis());
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(orderDto.getOrderDate() != null ? orderDto.getOrderDate() : java.time.LocalDate.now());
        order.setExpectedDeliveryDate(orderDto.getExpectedDeliveryDate());
        order.setDiscount(orderDto.getDiscount() != null ? orderDto.getDiscount() : BigDecimal.ZERO);
        order.setRemarks(orderDto.getRemarks());

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        if (orderDto.getItems() != null) {
            for (SalesOrderItemDto itemDto : orderDto.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));

                // We do NOT deduct inventory here, just validate if they even have the product
                Inventory inventory = inventoryRepository.findByProductId(product.getId())
                        .orElseThrow(() -> new RuntimeException("Inventory not found for product: " + product.getName()));
                
                SalesOrderItem item = new SalesOrderItem();
                item.setProduct(product);
                item.setQuantity(itemDto.getQuantity());
                item.setUnitPrice(product.getPrice());
                
                BigDecimal subTotal = product.getPrice().multiply(new BigDecimal(itemDto.getQuantity()));
                BigDecimal tax = subTotal.multiply(product.getGstPercentage()).divide(new BigDecimal(100));
                
                item.setSubTotal(subTotal);
                item.setTaxAmount(tax);

                totalAmount = totalAmount.add(subTotal).add(tax);
                totalTax = totalTax.add(tax);

                order.addItem(item);
            }
        }

        order.setTotalAmount(totalAmount.subtract(order.getDiscount()));
        order.setTotalTax(totalTax);

        SalesOrder savedOrder = salesOrderRepository.save(order);
        
        SalesOrderDto confirmedOrder = updateOrderStatus(savedOrder.getId(), OrderStatus.CONFIRMED);
        
        ShipmentDto shipmentDto = new ShipmentDto();
        shipmentDto.setSalesOrderId(savedOrder.getId());
        shipmentDto.setCarrierName("TBD");
        shipmentService.createShipment(shipmentDto);
        
        return confirmedOrder;
    }

    @Transactional
    public SalesOrderDto updateOrderStatus(Long id, OrderStatus status) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (status == OrderStatus.CONFIRMED && order.getStatus() == OrderStatus.PENDING) {
            // Deduct inventory
            for (SalesOrderItem item : order.getItems()) {
                Inventory inventory = inventoryRepository.findByProductId(item.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Inventory not found"));
                
                if (inventory.getAvailableStock() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock to confirm order for product: " + item.getProduct().getName());
                }
                
                inventory.setAvailableStock(inventory.getAvailableStock() - item.getQuantity());
                inventoryRepository.save(inventory);
            }
        }
        
        order.setStatus(status);
        return mapToDto(salesOrderRepository.save(order));
    }

    private SalesOrderDto mapToDto(SalesOrder order) {
        SalesOrderDto dto = new SalesOrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerId(order.getCustomer().getId());
        dto.setCustomerName(order.getCustomer().getName());
        dto.setStatus(order.getStatus().name());
        dto.setOrderDate(order.getOrderDate());
        dto.setExpectedDeliveryDate(order.getExpectedDeliveryDate());
        dto.setDiscount(order.getDiscount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setTotalTax(order.getTotalTax());
        dto.setRemarks(order.getRemarks());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(item -> {
                SalesOrderItemDto itemDto = new SalesOrderItemDto();
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
