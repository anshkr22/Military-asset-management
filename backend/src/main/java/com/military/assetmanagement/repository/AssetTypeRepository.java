package com.military.assetmanagement.repository;

import com.military.assetmanagement.entity.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetTypeRepository extends JpaRepository<AssetType, Integer> {
}