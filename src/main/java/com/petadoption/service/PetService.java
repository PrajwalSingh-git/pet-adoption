
package com.petadoption.service;

import com.petadoption.dao.PetDAO;
import com.petadoption.model.Pet;
import com.petadoption.model.PetStatus;
import com.petadoption.model.PetType;

import java.util.List;
import java.util.logging.Logger;

public class PetService {

    private static final Logger LOGGER = Logger.getLogger(PetService.class.getName());
    private final PetDAO petDAO;

    public PetService(PetDAO petDAO) {
        this.petDAO = petDAO;
    }

    public List<Pet> getPetsPage(String typeStr, Integer ageMin, Integer ageMax,
                                 String breed, String nameQuery, int page, int size) {

        PetType type = null;
        if (typeStr != null && !typeStr.isBlank()) {
            try {
                type = PetType.valueOf(typeStr);
            } catch (IllegalArgumentException e) {
                LOGGER.warning("Invalid pet type filter: " + typeStr);
            }
        }
        int offset = page * size;
        return petDAO.findPageFiltered(PetStatus.AVAILABLE, type, ageMin, ageMax, breed, nameQuery, offset, size);
    }

    public List<Pet> getAllPets() {
        return petDAO.findAll();
    }
}
