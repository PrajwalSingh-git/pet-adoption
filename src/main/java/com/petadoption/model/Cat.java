
package com.petadoption.model;

public class Cat extends Pet {
    public Cat(Long id, String name, String breed, int ageYears,
               String description, String imagePath, PetStatus status) {
        super(id, name, PetType.CAT, breed, ageYears, description, imagePath, status);
    }
    @Override
    public double getAdoptionFee() { return 2000.0; }
}
