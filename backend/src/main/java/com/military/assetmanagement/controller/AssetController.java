package com.military.assetmanagement.controller;

import com.military.assetmanagement.dto.AssetRequest;
import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.service.AssetService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public List<Asset> getAllAssets(
            @AuthenticationPrincipal Jwt jwt) {
        return assetService.getAllAssets(jwt);
    }

    @PostMapping
    public Asset createAsset(@Valid @RequestBody AssetRequest request) {
        return assetService.createAsset(request);
    }
}