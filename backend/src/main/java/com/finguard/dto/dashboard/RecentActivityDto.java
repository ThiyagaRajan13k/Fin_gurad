package com.finguard.dto.dashboard;

import java.time.LocalDateTime;

public class RecentActivityDto {
    private String id;
    private String action;
    private String description;
    private LocalDateTime timestamp;

    public RecentActivityDto() {}

    public RecentActivityDto(String id, String action, String description, LocalDateTime timestamp) {
        this.id = id;
        this.action = action;
        this.description = description;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
