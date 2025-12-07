package com.petadoption.dao;

import com.petadoption.model.AdoptionRequest;
import com.petadoption.model.AdoptionStatus;

import java.util.List;
import java.util.Optional;

public interface AdoptionRequestDAO {
    void save(AdoptionRequest request);
    Optional<AdoptionRequest> findById(Long id);
    void updateStatus(Long id, AdoptionStatus status);
    List<AdoptionRequest> findByStatus(AdoptionStatus status);
}
