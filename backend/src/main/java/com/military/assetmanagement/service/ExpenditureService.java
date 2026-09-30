package com.military.assetmanagement.service;

import com.military.assetmanagement.dto.ExpenditureRequest;
import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.entity.Assignment;
import com.military.assetmanagement.entity.Expenditure;
import com.military.assetmanagement.repository.AssetRepository;
import com.military.assetmanagement.repository.AssignmentRepository;
import com.military.assetmanagement.repository.ExpenditureRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpenditureService {

    private final ExpenditureRepository expenditureRepository;
    private final AssetRepository assetRepository;
    private final AssignmentRepository assignmentRepository;
    private final AuditLogService auditLogService;

    public ExpenditureService(
            ExpenditureRepository expenditureRepository,
            AssetRepository assetRepository,
            AssignmentRepository assignmentRepository,
            AuditLogService auditLogService) {

        this.expenditureRepository = expenditureRepository;
        this.assetRepository = assetRepository;
        this.assignmentRepository = assignmentRepository;
        this.auditLogService = auditLogService;
    }

    public List<Expenditure> getAllExpenditures() {
        return expenditureRepository.findAll();
    }

    @Transactional
    public Expenditure createExpenditure(
            ExpenditureRequest request,
            Jwt jwt) {

        Asset asset = assetRepository
                .findById(request.getAssetId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Asset not found"));

        String role = jwt.getClaimAsString("role");

        if ("BASE_COMMANDER".equals(role)) {

            Number baseIdClaim = jwt.getClaim("baseId");

            if (baseIdClaim == null) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Base Commander is not assigned to a base");
            }

            Integer commanderBaseId = baseIdClaim.intValue();

            if (!asset.getBase().getId().equals(
                    commanderBaseId)) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You can only manage assets from your own base");
            }
        }

        if (!"ASSIGNED".equals(asset.getStatus())) {
            throw new IllegalArgumentException(
                    "Only assigned assets can be expended");
        }

        Assignment activeAssignment = assignmentRepository
                .findFirstByAsset_IdAndReturnedDateIsNull(
                        asset.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No active assignment found for this asset"));

        LocalDateTime now = LocalDateTime.now();

        // Close the active assignment.
        activeAssignment.setReturnedDate(now);
        assignmentRepository.save(activeAssignment);

        Expenditure expenditure = new Expenditure();

        expenditure.setAsset(asset);
        expenditure.setExpenditureDate(now);
        expenditure.setReason(request.getReason());

        // Change asset status.
        asset.setStatus("EXPENDED");
        assetRepository.save(asset);

        Expenditure savedExpenditure = expenditureRepository.save(expenditure);

        auditLogService.log(
                jwt,
                "CREATE",
                "EXPENDITURE",
                savedExpenditure.getId());

        return savedExpenditure;
    }
}