package com.military.assetmanagement.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public class DashboardRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Integer getPurchaseQuantityBeforeDate(
            Integer baseId,
            LocalDate date) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COALESCE(SUM(quantity), 0) " +
                                "FROM purchases " +
                                "WHERE base_id = :baseId " +
                                "AND purchase_date < :date")
                .setParameter("baseId", baseId)
                .setParameter("date", date)
                .getSingleResult();

        return result.intValue();
    }

    public Integer getTransferInCountBeforeDate(
            Integer baseId,
            LocalDate date) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) " +
                                "FROM transfers " +
                                "WHERE to_base_id = :baseId " +
                                "AND transfer_date < :date")
                .setParameter("baseId", baseId)
                .setParameter("date", date.atStartOfDay())
                .getSingleResult();

        return result.intValue();
    }

    public Integer getTransferOutCountBeforeDate(
            Integer baseId,
            LocalDate date) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) " +
                                "FROM transfers " +
                                "WHERE from_base_id = :baseId " +
                                "AND transfer_date < :date")
                .setParameter("baseId", baseId)
                .setParameter("date", date.atStartOfDay())
                .getSingleResult();

        return result.intValue();
    }

    public Integer getExpenditureCountBeforeDate(
            Integer baseId,
            LocalDate date) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) " +
                                "FROM expenditures e " +
                                "JOIN assets a ON e.asset_id = a.id " +
                                "WHERE a.base_id = :baseId " +
                                "AND e.expenditure_date < :date")
                .setParameter("baseId", baseId)
                .setParameter("date", date.atStartOfDay())
                .getSingleResult();

        return result.intValue();
    }

    public Integer getPurchaseQuantityBetweenDates(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COALESCE(SUM(quantity), 0) " +
                                "FROM purchases " +
                                "WHERE base_id = :baseId " +
                                "AND purchase_date >= :fromDate " +
                                "AND purchase_date <= :toDate")
                .setParameter("baseId", baseId)
                .setParameter("fromDate", fromDate)
                .setParameter("toDate", toDate)
                .getSingleResult();

        return result.intValue();
    }

    public Integer getTransferInCountBetweenDates(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) " +
                                "FROM transfers " +
                                "WHERE to_base_id = :baseId " +
                                "AND transfer_date >= :fromDateTime " +
                                "AND transfer_date < :toDateTime")
                .setParameter("baseId", baseId)
                .setParameter("fromDateTime", fromDate.atStartOfDay())
                .setParameter("toDateTime", toDate.plusDays(1).atStartOfDay())
                .getSingleResult();

        return result.intValue();
    }

    public Integer getTransferOutCountBetweenDates(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) " +
                                "FROM transfers " +
                                "WHERE from_base_id = :baseId " +
                                "AND transfer_date >= :fromDateTime " +
                                "AND transfer_date < :toDateTime")
                .setParameter("baseId", baseId)
                .setParameter("fromDateTime", fromDate.atStartOfDay())
                .setParameter("toDateTime", toDate.plusDays(1).atStartOfDay())
                .getSingleResult();

        return result.intValue();
    }

    public Integer getExpenditureCountBetweenDates(
            Integer baseId,
            LocalDate fromDate,
            LocalDate toDate) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) " +
                                "FROM expenditures e " +
                                "JOIN assets a ON e.asset_id = a.id " +
                                "WHERE a.base_id = :baseId " +
                                "AND e.expenditure_date >= :fromDateTime " +
                                "AND e.expenditure_date < :toDateTime")
                .setParameter("baseId", baseId)
                .setParameter("fromDateTime", fromDate.atStartOfDay())
                .setParameter("toDateTime", toDate.plusDays(1).atStartOfDay())
                .getSingleResult();

        return result.intValue();
    }

    public Integer getAssignedCount(Integer baseId) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) " +
                                "FROM assets " +
                                "WHERE base_id = :baseId " +
                                "AND status = 'ASSIGNED'")
                .setParameter("baseId", baseId)
                .getSingleResult();

        return result.intValue();
    }

    public Integer getExpendedCount(Integer baseId) {

        Number result = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) " +
                                "FROM assets " +
                                "WHERE base_id = :baseId " +
                                "AND status = 'EXPENDED'")
                .setParameter("baseId", baseId)
                .getSingleResult();

        return result.intValue();
    }

}