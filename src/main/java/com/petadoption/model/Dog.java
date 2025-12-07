
package com.petadoption.model;

public class Dog extends Pet {
    public Dog(Long id, String name, String breed, int ageYears,
               String description, String imagePath, PetStatus status) {
        super(id, name, PetType.DOG, breed, ageYears, description, imagePath, status);
    }
    @Override
    public double getAdoptionFee() { return 2500.0; }
}
