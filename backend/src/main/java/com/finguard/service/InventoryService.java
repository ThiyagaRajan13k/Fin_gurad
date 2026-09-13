package com.finguard.service;

import com.finguard.dto.InventoryDto;
import com.finguard.entity.Inventory;
import com.finguard.entity.Product;
import com.finguard.repository.InventoryRepository;
import com.finguard.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    @Autowired
    public InventoryService(InventoryRepository inventoryRepository, ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    public List<InventoryDto> getAllInventory() {
        return inventoryRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public InventoryDto getInventoryByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product"));
        return convertToDto(inventory);
    }

    public InventoryDto createOrUpdateInventory(InventoryDto dto) {
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Inventory inventory = inventoryRepository.findByProductId(dto.getProductId()).orElse(new Inventory());
        
        inventory.setProduct(product);
        inventory.setAvailableStock(dto.getAvailableStock());
        inventory.setLowStockAlertLevel(dto.getLowStockAlertLevel());
        
        return convertToDto(inventoryRepository.save(inventory));
    }

    public InventoryDto adjustStock(Long productId, Integer adjustmentAmount) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for product"));
                
        inventory.setAvailableStock(inventory.getAvailableStock() + adjustmentAmount);
        if(inventory.getAvailableStock() < 0) {
            throw new RuntimeException("Cannot have negative stock");
        }
        
        return convertToDto(inventoryRepository.save(inventory));
    }

    public void syncMissingInventory() {
        List<Product> allProducts = productRepository.findAll();
        for (Product product : allProducts) {
            if (inventoryRepository.findByProductId(product.getId()).isEmpty()) {
                Inventory inventory = new Inventory();
                inventory.setProduct(product);
                inventory.setAvailableStock(0);
                inventory.setLowStockAlertLevel(10);
                inventoryRepository.save(inventory);
            }
        }
    }

    private InventoryDto convertToDto(Inventory inventory) {
        InventoryDto dto = new InventoryDto();
        dto.setId(inventory.getId());
        if (inventory.getProduct() != null) {
            dto.setProductId(inventory.getProduct().getId());
            dto.setProductCode(inventory.getProduct().getProductCode());
            dto.setProductName(inventory.getProduct().getName());
        }
        dto.setAvailableStock(inventory.getAvailableStock());
        dto.setLowStockAlertLevel(inventory.getLowStockAlertLevel());
        return dto;
    }
}
