package com.military.assetmanagement.repository;

import com.military.assetmanagement.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssignmentRepository
        extends JpaRepository<Assignment, Integer> {

    Optional<Assignment> findFirstByAsset_IdAndReturnedDateIsNull(
            Integer assetId);
}