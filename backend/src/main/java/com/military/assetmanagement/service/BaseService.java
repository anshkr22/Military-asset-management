package com.military.assetmanagement.service;

import com.military.assetmanagement.entity.Base;
import com.military.assetmanagement.repository.BaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BaseService {

    private final BaseRepository baseRepository;

    public BaseService(BaseRepository baseRepository) {
        this.baseRepository = baseRepository;
    }

    public List<Base> getAllBases() {
        return baseRepository.findAll();
    }

    public Base createBase(Base base) {
        return baseRepository.save(base);
    }
}