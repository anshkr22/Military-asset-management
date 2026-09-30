package com.military.assetmanagement.controller;

import com.military.assetmanagement.entity.AssetType;
import com.military.assetmanagement.repository.AssetTypeRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/asset-types")
public class AssetTypeController {

    private final AssetTypeRepository assetTypeRepository;

    public AssetTypeController(AssetTypeRepository assetTypeRepository) {
        this.assetTypeRepository = assetTypeRepository;
    }

    @GetMapping
    public List<AssetType> getAllAssetTypes() {
        return assetTypeRepository.findAll();
    }
}