package com.military.assetmanagement.service;

import com.military.assetmanagement.dto.AssetRequest;
import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.entity.AssetType;
import com.military.assetmanagement.entity.Base;
import org.springframework.security.oauth2.jwt.Jwt;
import com.military.assetmanagement.repository.AssetRepository;
import com.military.assetmanagement.repository.AssetTypeRepository;
import com.military.assetmanagement.repository.BaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetTypeRepository assetTypeRepository;
    private final BaseRepository baseRepository;

    public AssetService(
            AssetRepository assetRepository,
            AssetTypeRepository assetTypeRepository,
            BaseRepository baseRepository) {

        this.assetRepository = assetRepository;
        this.assetTypeRepository = assetTypeRepository;
        this.baseRepository = baseRepository;
    }

    public List<Asset> getAllAssets(Jwt jwt) {

        String role = jwt.getClaimAsString("role");

        if ("ADMIN".equals(role) ||
                "LOGISTICS_OFFICER".equals(role)) {

            return assetRepository.findAll();
        }

        if ("BASE_COMMANDER".equals(role)) {

            Number baseIdClaim = jwt.getClaim("baseId");

            if (baseIdClaim == null) {
                throw new IllegalArgumentException(
                        "Base Commander is not assigned to a base");
            }

            Integer baseId = baseIdClaim.intValue();

            return assetRepository.findByBase_Id(baseId);
        }

        throw new IllegalArgumentException(
                "Access denied");
    }

    public Asset createAsset(AssetRequest request) {

        AssetType assetType = assetTypeRepository
                .findById(request.getAssetTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Asset type not found"));

        Base base = baseRepository
                .findById(request.getBaseId())
                .orElseThrow(() -> new IllegalArgumentException("Base not found"));

        Asset asset = new Asset();

        asset.setAssetCode(request.getAssetCode());
        asset.setAssetType(assetType);
        asset.setBase(base);
        asset.setStatus(request.getStatus());

        return assetRepository.save(asset);
    }
}