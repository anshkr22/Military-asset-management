package com.military.assetmanagement.controller;

import com.military.assetmanagement.dto.AssignmentRequest;
import com.military.assetmanagement.entity.Assignment;
import com.military.assetmanagement.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(
            AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public List<Assignment> getAllAssignments() {
        return assignmentService.getAllAssignments();
    }

    @PostMapping
    public Assignment createAssignment(
            @Valid @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        return assignmentService.createAssignment(
                request,
                jwt);
    }

    @PutMapping("/{id}/return")
    public Assignment returnAssignment(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt) {

        return assignmentService.returnAssignment(
                id,
                jwt);
    }
}