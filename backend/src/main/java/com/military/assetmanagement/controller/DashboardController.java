package com.military.assetmanagement.controller;

import com.military.assetmanagement.dto.DashboardResponse;
import com.military.assetmanagement.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getDashboard(
            @RequestParam Integer baseId,

            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,

            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,

            @AuthenticationPrincipal Jwt jwt) {

        String role = jwt.getClaimAsString("role");

        if ("BASE_COMMANDER".equals(role)) {

            Number baseIdClaim = jwt.getClaim("baseId");

            if (baseIdClaim == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Base Commander is not assigned to a base");
            }

            Integer commanderBaseId = baseIdClaim.intValue();

            if (!commanderBaseId.equals(baseId)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You can only view your own base dashboard");
            }
        }

        return dashboardService.getDashboard(
                baseId,
                fromDate,
                toDate);
    }
}