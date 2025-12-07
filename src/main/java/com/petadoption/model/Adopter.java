package com.petadoption.model;

public class Adopter extends User {

    public Adopter(Long id, String email, String passwordHash, String fullName) {
        super(id, email, passwordHash, fullName);
    }

    @Override
    public String getRole() {
        return "ADOPTER";
    }
}
