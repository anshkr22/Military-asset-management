package com.military.assetmanagement.repository;

import com.military.assetmanagement.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Integer> {

    List<Asset> findByBase_Id(Integer baseId);
}