package com.military.assetmanagement.service;

import com.military.assetmanagement.dto.TransferRequest;
import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.entity.Base;
import com.military.assetmanagement.entity.Transfer;
import com.military.assetmanagement.repository.AssetRepository;
import com.military.assetmanagement.repository.BaseRepository;
import com.military.assetmanagement.repository.TransferRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final AssetRepository assetRepository;
    private final BaseRepository baseRepository;
    private final AuditLogService auditLogService;

    public TransferService(
            TransferRepository transferRepository,
            AssetRepository assetRepository,
            BaseRepository baseRepository,
            AuditLogService auditLogService) {

        this.transferRepository = transferRepository;
        this.assetRepository = assetRepository;
        this.baseRepository = baseRepository;
        this.auditLogService = auditLogService;
    }

    public List<Transfer> getAllTransfers() {
        return transferRepository.findAll();
    }

    @Transactional
    public Transfer createTransfer(
            TransferRequest request,
            Jwt jwt) {

        Asset asset = assetRepository
                .findById(request.getAssetId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Asset not found"));

        Base fromBase = baseRepository
                .findById(request.getFromBaseId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Source base not found"));

        Base toBase = baseRepository
                .findById(request.getToBaseId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Destination base not found"));

        String role = jwt.getClaimAsString("role");

        // Logistics Officer can transfer only from their own base.
        if ("LOGISTICS_OFFICER".equals(role)) {

            Number baseIdClaim = jwt.getClaim("baseId");

            if (baseIdClaim == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Logistics Officer is not assigned to a base");
            }

            Integer officerBaseId = baseIdClaim.intValue();

            if (!fromBase.getId().equals(officerBaseId)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You can only transfer assets from your own base");
            }
        }

        if (fromBase.getId().equals(toBase.getId())) {
            throw new IllegalArgumentException(
                    "Source and destination bases must be different");
        }

        if (!asset.getBase().getId().equals(
                fromBase.getId())) {
            throw new IllegalArgumentException(
                    "Asset does not currently belong to the source base");
        }

        // Only available assets can be transferred.
        if (!"AVAILABLE".equals(asset.getStatus())) {
            throw new IllegalArgumentException(
                    "Only available assets can be transferred");
        }

        Transfer transfer = new Transfer();

        transfer.setAsset(asset);
        transfer.setFromBase(fromBase);
        transfer.setToBase(toBase);

        if (request.getTransferDate() != null) {
            transfer.setTransferDate(
                    request.getTransferDate());
        } else {
            transfer.setTransferDate(
                    LocalDateTime.now());
        }

        transfer.setStatus("COMPLETED");

        // Move asset to destination base.
        asset.setBase(toBase);

        Transfer savedTransfer = transferRepository.save(transfer);

        assetRepository.save(asset);

        auditLogService.log(
                jwt,
                "CREATE",
                "TRANSFER",
                savedTransfer.getId());

        return savedTransfer;
    }
}