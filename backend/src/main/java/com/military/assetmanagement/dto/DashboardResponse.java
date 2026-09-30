package com.military.assetmanagement.dto;

public class DashboardResponse {

    private Integer openingBalance;
    private Integer closingBalance;
    private Integer netMovement;
    private Integer assigned;
    private Integer expended;

    public DashboardResponse() {
    }

    public DashboardResponse(
            Integer openingBalance,
            Integer closingBalance,
            Integer netMovement,
            Integer assigned,
            Integer expended) {

        this.openingBalance = openingBalance;
        this.closingBalance = closingBalance;
        this.netMovement = netMovement;
        this.assigned = assigned;
        this.expended = expended;
    }

    public Integer getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(Integer openingBalance) {
        this.openingBalance = openingBalance;
    }

    public Integer getClosingBalance() {
        return closingBalance;
    }

    public void setClosingBalance(Integer closingBalance) {
        this.closingBalance = closingBalance;
    }

    public Integer getNetMovement() {
        return netMovement;
    }

    public void setNetMovement(Integer netMovement) {
        this.netMovement = netMovement;
    }

    public Integer getAssigned() {
        return assigned;
    }

    public void setAssigned(Integer assigned) {
        this.assigned = assigned;
    }

    public Integer getExpended() {
        return expended;
    }

    public void setExpended(Integer expended) {
        this.expended = expended;
    }
}