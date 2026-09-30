package com.military.assetmanagement.dto;

import java.time.LocalDateTime;

public class AuditLogResponse {

    private Integer userId;
    private String username;
    private String action;
    private String entityType;
    private Integer entityId;
    private LocalDateTime createdAt;

    public AuditLogResponse() {
    }

    public AuditLogResponse(
            Integer userId,
            String username,
            String action,
            String entityType,
            Integer entityId,
            LocalDateTime createdAt) {

        this.userId = userId;
        this.username = username;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.createdAt = createdAt;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public Integer getEntityId() {
        return entityId;
    }

    public void setEntityId(Integer entityId) {
        this.entityId = entityId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}