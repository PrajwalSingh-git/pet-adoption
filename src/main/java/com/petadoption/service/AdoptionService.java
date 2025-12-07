
package com.petadoption.service;

import com.petadoption.dao.AdoptionRequestDAO;
import com.petadoption.dao.PetDAO;
import com.petadoption.exception.ValidationException;
import com.petadoption.model.*;

import java.util.List;
import java.util.logging.Logger;

public class AdoptionService {

    private static final Logger LOGGER = Logger.getLogger(AdoptionService.class.getName());
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

        AdoptionRequest req = new AdoptionRequest();
        req.setPetId(petId);
        req.setAdopterId(adopterId);
        req.setMessage(message);
        req.setStatus(AdoptionStatus.PENDING);
        requestDAO.save(req);
        petDAO.updateStatus(petId, PetStatus.PENDING);
        LOGGER.info("Adoption request submitted for pet " + petId + " by adopter " + adopterId);
    }

    public void approveRequest(Long requestId) {
        AdoptionRequest req = requestDAO.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        requestDAO.updateStatus(requestId, AdoptionStatus.APPROVED);
        petDAO.updateStatus(req.getPetId(), PetStatus.ADOPTED);
        LOGGER.info("Adoption request approved: " + requestId);
    }

    public void rejectRequest(Long requestId) {
        AdoptionRequest req = requestDAO.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        requestDAO.updateStatus(requestId, AdoptionStatus.REJECTED);
        petDAO.updateStatus(req.getPetId(), PetStatus.AVAILABLE);
        LOGGER.info("Adoption request rejected: " + requestId);
    }

    public List<AdoptionRequest> listPendingRequests() {
        return requestDAO.findByStatus(AdoptionStatus.PENDING);
    }
}
