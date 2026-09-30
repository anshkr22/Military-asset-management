package com.military.assetmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ExpenditureRequest {

    @NotNull(message = "Asset ID is required")
    private Integer assetId;

    @NotBlank(message = "Reason is required")
    private String reason;

    public ExpenditureRequest() {
    }

    public Integer getAssetId() {
        return assetId;
    }

    public void setAssetId(Integer assetId) {
        this.assetId = assetId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
