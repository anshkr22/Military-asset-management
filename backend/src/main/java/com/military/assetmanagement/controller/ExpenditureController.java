package com.military.assetmanagement.controller;

import com.military.assetmanagement.dto.ExpenditureRequest;
import com.military.assetmanagement.entity.Expenditure;
import com.military.assetmanagement.service.ExpenditureService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenditures")
public class ExpenditureController {

    private final ExpenditureService expenditureService;

    public ExpenditureController(ExpenditureService expenditureService) {
        this.expenditureService = expenditureService;
    }

    @GetMapping
    public List<Expenditure> getAllExpenditures() {
        return expenditureService.getAllExpenditures();
    }

    @PostMapping
    public Expenditure createExpenditure(
            @Valid @RequestBody ExpenditureRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return expenditureService.createExpenditure(request, jwt);
    }
}