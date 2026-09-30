package com.military.assetmanagement.service;

import com.military.assetmanagement.dto.PurchaseRequest;
import com.military.assetmanagement.entity.AssetType;
import com.military.assetmanagement.entity.Base;
import com.military.assetmanagement.entity.Purchase;
import com.military.assetmanagement.repository.AssetTypeRepository;
import com.military.assetmanagement.repository.BaseRepository;
import com.military.assetmanagement.repository.PurchaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final BaseRepository baseRepository;
    private final AssetTypeRepository assetTypeRepository;

    public PurchaseService(
            PurchaseRepository purchaseRepository,
            BaseRepository baseRepository,
            AssetTypeRepository assetTypeRepository) {

        this.purchaseRepository = purchaseRepository;
        this.baseRepository = baseRepository;
        this.assetTypeRepository = assetTypeRepository;
    }

    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    public Purchase createPurchase(PurchaseRequest request) {

        Base base = baseRepository
                .findById(request.getBaseId())
                .orElseThrow(() -> new IllegalArgumentException("Base not found"));

        AssetType assetType = assetTypeRepository
                .findById(request.getAssetTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Asset type not found"));

        Purchase purchase = new Purchase();

        purchase.setBase(base);
        purchase.setAssetType(assetType);
        purchase.setQuantity(request.getQuantity());
        purchase.setPurchaseDate(request.getPurchaseDate());

        return purchaseRepository.save(purchase);
    }
}