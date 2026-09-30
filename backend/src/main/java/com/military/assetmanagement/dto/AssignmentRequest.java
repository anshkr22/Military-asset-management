package com.military.assetmanagement.dto;

import jakarta.validation.constraints.NotNull;

public class AssignmentRequest {

    @NotNull(message = "Asset ID is required")
    private Integer assetId;

    @NotNull(message = "User ID is required")
    private Integer assignedToUserId;

    public AssignmentRequest() {
    }

    public Integer getAssetId() {
        return assetId;
    }

    public void setAssetId(Integer assetId) {
        this.assetId = assetId;
    }

    public Integer getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(Integer assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }
}