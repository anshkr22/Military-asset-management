package com.military.assetmanagement.controller;

import com.military.assetmanagement.dto.BaseRequest;
import com.military.assetmanagement.entity.Base;
import com.military.assetmanagement.service.BaseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/bases")
public class BaseController {

    private final BaseService baseService;

    public BaseController(BaseService baseService) {
        this.baseService = baseService;
    }

    @GetMapping
    public List<Base> getAllBases() {
        return baseService.getAllBases();
    }

    @PostMapping
    public Base createBase(@Valid @RequestBody BaseRequest request) {

        Base base = new Base();

        base.setName(request.getName());
        base.setLocation(request.getLocation());

        return baseService.createBase(base);
    }
}