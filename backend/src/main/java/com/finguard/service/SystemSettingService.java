package com.finguard.service;

import com.finguard.entity.SystemSetting;
import com.finguard.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    public List<SystemSetting> getSettingsByCategory(String category) {
        return systemSettingRepository.findByCategory(category);
    }

    public Optional<SystemSetting> getSetting(String key) {
        return systemSettingRepository.findById(key);
    }

    @Transactional
    public void updateSettings(Map<String, String> settings) {
        settings.forEach((key, value) -> {
            systemSettingRepository.findById(key).ifPresent(setting -> {
                setting.setSettingValue(value);
                systemSettingRepository.save(setting);
            });
        });
    }
}
