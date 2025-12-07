package com.petadoption.service;

import com.petadoption.dao.AdoptionRequestDAO;
import com.petadoption.dao.PetDAO;
import com.petadoption.exception.ValidationException;
import com.petadoption.model.*;

import java.util.List;

public class AdoptionService {

    private final AdoptionRequestDAO requestDAO;
    private final PetDAO petDAO;

    public AdoptionService(AdoptionRequestDAO requestDAO, PetDAO petDAO) {
        this.requestDAO = requestDAO;
        this.petDAO = petDAO;
    }

    public void submitRequest(Long petId, Long adopterId, String message) throws ValidationException {
        Pet pet = petDAO.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found."));

        if (pet.getStatus() != PetStatus.AVAILABLE) {
            throw new ValidationException("Pet is not available for adoption.");
        }

        AdoptionRequest request = new AdoptionRequest();
        request.setPetId(petId);
        request.setAdopterId(adopterId);
        request.setMessage(message);
        request.setStatus(AdoptionStatus.PENDING);

        requestDAO.save(request);
        petDAO.updateStatus(petId, PetStatus.PENDING);
    }

    public void approveRequest(Long requestId) {
        AdoptionRequest request = requestDAO.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        requestDAO.updateStatus(requestId, AdoptionStatus.APPROVED);
        petDAO.updateStatus(request.getPetId(), PetStatus.ADOPTED);
    }

    public void rejectRequest(Long requestId) {
        AdoptionRequest request = requestDAO.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        requestDAO.updateStatus(requestId, AdoptionStatus.REJECTED);
        petDAO.updateStatus(request.getPetId(), PetStatus.AVAILABLE);
    }

    public List<AdoptionRequest> listPendingRequests() {
        return requestDAO.findByStatus(AdoptionStatus.PENDING);
    }
}
