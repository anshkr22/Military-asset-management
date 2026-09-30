package com.military.assetmanagement.controller;

import com.military.assetmanagement.dto.PurchaseRequest;
import com.military.assetmanagement.entity.Purchase;
import com.military.assetmanagement.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @GetMapping
    public List<Purchase> getAllPurchases() {
        return purchaseService.getAllPurchases();
    }

    @PostMapping
    public Purchase createPurchase(
            @Valid @RequestBody PurchaseRequest request) {

        return purchaseService.createPurchase(request);
    }
}