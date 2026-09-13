package com.finguard.service;

import com.finguard.dto.ProductDto;
import com.finguard.entity.Category;
import com.finguard.entity.Product;
import com.finguard.repository.CategoryRepository;
import com.finguard.repository.ProductRepository;
import com.finguard.repository.InventoryRepository;
import com.finguard.entity.Inventory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    @Autowired
    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDto(product);
    }

    public ProductDto createProduct(ProductDto dto) {
        if (productRepository.findByProductCode(dto.getProductCode()).isPresent()) {
            throw new RuntimeException("Product code already exists");
        }
        Product product = new Product();
        updateEntityFromDto(product, dto);
        Product savedProduct = productRepository.save(product);
        
        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setAvailableStock(0);
        inventory.setLowStockAlertLevel(10);
        inventoryRepository.save(inventory);
        
        return convertToDto(savedProduct);
    }

    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        updateEntityFromDto(product, dto);
        return convertToDto(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setProductCode(product.getProductCode());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        dto.setPrice(product.getPrice());
        dto.setGstPercentage(product.getGstPercentage());
        dto.setUnit(product.getUnit());
        dto.setStatus(product.getStatus());
        return dto;
    }

    private void updateEntityFromDto(Product product, ProductDto dto) {
        product.setProductCode(dto.getProductCode());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        } else if (dto.getCategoryName() != null && !dto.getCategoryName().trim().isEmpty()) {
            Category category = categoryRepository.findByName(dto.getCategoryName().trim())
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(dto.getCategoryName().trim());
                        newCat.setDescription(dto.getCategoryName().trim());
                        return categoryRepository.save(newCat);
                    });
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }
        
        product.setPrice(dto.getPrice());
        product.setGstPercentage(dto.getGstPercentage());
        product.setUnit(dto.getUnit());
        product.setStatus(dto.getStatus());
    }
}
