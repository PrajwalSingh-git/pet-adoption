package com.petadoption.dao;

import com.petadoption.model.Pet;
import com.petadoption.model.PetStatus;

import java.util.List;
import java.util.Optional;

public interface PetDAO {
    List<Pet> findAll();
    List<Pet> findByStatus(PetStatus status);
    Optional<Pet> findById(Long id);
    void save(Pet pet);
    void updateStatus(Long id, PetStatus status);
}
