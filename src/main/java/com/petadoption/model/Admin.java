
package com.petadoption.model;

public class Admin extends User {
    public Admin(Long id, String email, String passwordHash, String fullName) {
        super(id, email, passwordHash, fullName);
    }
    @Override
    public String getRole() { return "ADMIN"; }
}
