package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.dto.InventoryDto;
import com.finguard.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    @Autowired
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<InventoryDto>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getInventoryByProductId(@PathVariable Long productId) {
        try {
            return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdateInventory(@RequestBody InventoryDto dto) {
        try {
            InventoryDto updated = inventoryService.createOrUpdateInventory(dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/adjust")
    public ResponseEntity<?> adjustStock(@RequestBody Map<String, Object> payload) {
        try {
            Long productId = Long.valueOf(payload.get("productId").toString());
            Integer amount = Integer.valueOf(payload.get("amount").toString());
            InventoryDto updated = inventoryService.adjustStock(productId, amount);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncMissingInventory() {
        try {
            inventoryService.syncMissingInventory();
            return ResponseEntity.ok(new ApiResponse(true, "Inventory synced successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
