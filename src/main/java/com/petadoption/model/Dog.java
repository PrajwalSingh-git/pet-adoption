package com.petadoption.model;

public class Dog extends Pet {

    public Dog(Long id, String name, String breed, int ageYears,
               String description, PetStatus status) {
        super(id, name, PetType.DOG, breed, ageYears, description, status);
    }

    @Override
    public double getAdoptionFee() {
        return 2500.0;
    }
}
