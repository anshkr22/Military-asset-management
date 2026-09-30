package com.military.assetmanagement.service;

import com.military.assetmanagement.dto.AssignmentRequest;
import com.military.assetmanagement.entity.Asset;
import com.military.assetmanagement.entity.Assignment;
import com.military.assetmanagement.entity.User;
import com.military.assetmanagement.repository.AssetRepository;
import com.military.assetmanagement.repository.AssignmentRepository;
import com.military.assetmanagement.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            AssetRepository assetRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {

        this.assignmentRepository = assignmentRepository;
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    @Transactional
    public Assignment createAssignment(
            AssignmentRequest request,
            Jwt jwt) {

        Asset asset = assetRepository.findById(
                request.getAssetId()).orElseThrow(
                        () -> new IllegalArgumentException(
                                "Asset not found"));

        User user = userRepository.findById(
                request.getAssignedToUserId()).orElseThrow(
                        () -> new IllegalArgumentException(
                                "User not found"));

        String role = jwt.getClaimAsString("role");

        if ("BASE_COMMANDER".equals(role)) {

            Number baseIdClaim = jwt.getClaim("baseId");

            if (baseIdClaim == null) {
                throw new IllegalArgumentException(
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

        if (!"AVAILABLE".equals(asset.getStatus())) {
            throw new IllegalArgumentException(
                    "Asset is not available for assignment");
        }

        if (user.getBase() == null) {
            throw new IllegalArgumentException(
                    "User must be assigned to a base");
        }

        if (!asset.getBase().getId().equals(
                user.getBase().getId())) {
            throw new IllegalArgumentException(
                    "Asset and user must belong to the same base");
        }

        Assignment assignment = new Assignment();

        assignment.setAsset(asset);
        assignment.setAssignedToUser(user);
        assignment.setAssignedDate(
                LocalDateTime.now());
        assignment.setReturnedDate(null);

        asset.setStatus("ASSIGNED");
        assetRepository.save(asset);

        Assignment savedAssignment = assignmentRepository.save(assignment);

        auditLogService.log(
                jwt,
                "CREATE",
                "ASSIGNMENT",
                savedAssignment.getId());

        return savedAssignment;
    }

    @Transactional
    public Assignment returnAssignment(
            Integer assignmentId,
            Jwt jwt) {

        Assignment assignment = assignmentRepository.findById(
                assignmentId).orElseThrow(
                        () -> new IllegalArgumentException(
                                "Assignment not found"));

        if (assignment.getReturnedDate() != null) {
            throw new IllegalArgumentException(
                    "Asset has already been returned");
        }

        Asset asset = assignment.getAsset();

        String role = jwt.getClaimAsString("role");

        if ("BASE_COMMANDER".equals(role)) {

            Number baseIdClaim = jwt.getClaim("baseId");

            if (baseIdClaim == null) {
                throw new IllegalArgumentException(
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
                    "Asset is not currently assigned");
        }

        assignment.setReturnedDate(
                LocalDateTime.now());

        asset.setStatus("AVAILABLE");

        assetRepository.save(asset);

        Assignment savedAssignment = assignmentRepository.save(assignment);

        auditLogService.log(
                jwt,
                "RETURN",
                "ASSIGNMENT",
                savedAssignment.getId());

        return savedAssignment;
    }
}