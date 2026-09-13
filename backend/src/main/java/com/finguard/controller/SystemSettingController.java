package com.finguard.controller;

import com.finguard.dto.ApiResponse;
import com.finguard.entity.SystemSetting;
import com.finguard.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingController {

    @Autowired
    private SystemSettingService systemSettingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllSettings() {
        List<SystemSetting> settings = systemSettingService.getAllSettings();
        return ResponseEntity.ok(new ApiResponse(true, "Settings retrieved successfully", settings));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateSettings(@RequestBody Map<String, String> settings) {
        systemSettingService.updateSettings(settings);
        return ResponseEntity.ok(new ApiResponse(true, "Settings updated successfully", null));
    }
}
