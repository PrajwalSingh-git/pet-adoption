package com.petadoption.service;

import com.petadoption.dao.PetDAO;
import com.petadoption.model.Pet;
import com.petadoption.model.PetStatus;

import java.util.List;
import java.util.stream.Collectors;

public class PetService {

    private final PetDAO petDAO;

    public PetService(PetDAO petDAO) {
        this.petDAO = petDAO;
    }

    public List<Pet> getAvailablePets() {
        return petDAO.findByStatus(PetStatus.AVAILABLE);
    }

    public List<Pet> searchPetsByName(String query) {
        List<Pet> allAvailable = getAvailablePets();
        String lower = query == null ? "" : query.toLowerCase();
        return allAvailable.stream()
                .filter(p -> p.getName() != null && p.getName().toLowerCase().contains(lower))
                .collect(Collectors.toList());
    }
}
