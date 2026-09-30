package com.military.assetmanagement.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class TransferRequest {

    @NotNull(message = "Asset ID is required")
    private Integer assetId;

    @NotNull(message = "Source base ID is required")
    private Integer fromBaseId;

    @NotNull(message = "Destination base ID is required")
    private Integer toBaseId;

    private LocalDateTime transferDate;

    public TransferRequest() {
    }

    public Integer getAssetId() {
        return assetId;
    }

    public void setAssetId(Integer assetId) {
        this.assetId = assetId;
    }

    public Integer getFromBaseId() {
        return fromBaseId;
    }

    public void setFromBaseId(Integer fromBaseId) {
        this.fromBaseId = fromBaseId;
    }

    public Integer getToBaseId() {
        return toBaseId;
    }

    public void setToBaseId(Integer toBaseId) {
        this.toBaseId = toBaseId;
    }

    public LocalDateTime getTransferDate() {
        return transferDate;
    }

    public void setTransferDate(LocalDateTime transferDate) {
        this.transferDate = transferDate;
    }
}