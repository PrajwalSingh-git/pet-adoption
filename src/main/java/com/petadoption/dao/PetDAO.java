
package com.petadoption.dao;

import com.petadoption.model.Pet;
import com.petadoption.model.PetStatus;
import com.petadoption.model.PetType;

import java.util.List;
import java.util.Optional;

public interface PetDAO {
    List<Pet> findPageFiltered(PetStatus status, PetType type, Integer ageMin, Integer ageMax,
                               String breed, String nameQuery, int offset, int limit);
    Optional<Pet> findById(Long id);
    void save(Pet pet);
    void update(Pet pet);
    void delete(Long id);
    void updateStatus(Long id, PetStatus status);
    List<Pet> findAll();
}
