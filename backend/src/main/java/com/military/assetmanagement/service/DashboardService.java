package com.military.assetmanagement.service;

import com.military.assetmanagement.dto.DashboardResponse;
import com.military.assetmanagement.repository.DashboardRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public Integer getPurchaseQuantityBeforeDate(
            Integer baseId,
            LocalDate date) {

        return dashboardRepository.getPurchaseQuantityBeforeDate(
                baseId,
                date);
    }

    public Integer getTransferInCountBeforeDate(
            Integer baseId,
            LocalDate date) {

        return dashboardRepository.getTransferInCountBeforeDate(
                baseId,
                date);
    }

    public Integer getTransferOutCountBeforeDate(
            Integer baseId,
            LocalDate date) {

        return dashboardRepository.getTransferOutCountBeforeDate(
                baseId,
                date);
    }

    public Integer getExpenditureCountBeforeDate(
            Integer baseId,
            LocalDate date) {

        return dashboardRepository.getExpenditureCountBeforeDate(
                baseId,
                date);
    }

    public Integer getOpeningBalance(
            Integer baseId,
            LocalDate date) {

        Integer purchases = getPurchaseQuantityBeforeDate(baseId, date);

        Integer transferIn = getTransferInCountBeforeDate(baseId, date);

        Integer transferOut = getTransferOutCountBeforeDate(baseId, date);

        Integer expenditures = getExpenditureCountBeforeDate(baseId, date);

        return purchases
                + transferIn
                - transferOut
                - expenditures;
    }

    public Integer getPurchaseQuantityBetweenDates(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        return dashboardRepository.getPurchaseQuantityBetweenDates(
                baseId,
                fromDate,
                toDate);
    }

    public Integer getTransferInCountBetweenDates(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        return dashboardRepository.getTransferInCountBetweenDates(
                baseId,
                fromDate,
                toDate);
    }

    public Integer getTransferOutCountBetweenDates(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        return dashboardRepository.getTransferOutCountBetweenDates(
                baseId,
                fromDate,
                toDate);
    }

    public Integer getExpenditureCountBetweenDates(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        return dashboardRepository.getExpenditureCountBetweenDates(
                baseId,
                fromDate,
                toDate);
    }

    public Integer getNetMovement(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        Integer purchases = getPurchaseQuantityBetweenDates(
                baseId, fromDate, toDate);

        Integer transferIn = getTransferInCountBetweenDates(
                baseId, fromDate, toDate);

        Integer transferOut = getTransferOutCountBetweenDates(
                baseId, fromDate, toDate);

        Integer expenditures = getExpenditureCountBetweenDates(
                baseId, fromDate, toDate);

        return purchases
                + transferIn
                - transferOut
                - expenditures;
    }

    public Integer getClosingBalance(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        Integer openingBalance = getOpeningBalance(baseId, fromDate);

        Integer netMovement = getNetMovement(baseId, fromDate, toDate);

        return openingBalance + netMovement;
    }

    public Integer getAssignedCount(Integer baseId) {
        return dashboardRepository.getAssignedCount(baseId);
    }

    public Integer getExpendedCount(Integer baseId) {
        return dashboardRepository.getExpendedCount(baseId);
    }

    public DashboardResponse getDashboard(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        Integer openingBalance = getOpeningBalance(baseId, fromDate);

        Integer netMovement = getNetMovement(baseId, fromDate, toDate);

        Integer closingBalance = openingBalance + netMovement;

        Integer assigned = getAssignedCount(baseId);

        Integer expended = getExpendedCount(baseId);

        return new DashboardResponse(
                openingBalance,
                closingBalance,
                netMovement,
                assigned,
                expended);
    }

}