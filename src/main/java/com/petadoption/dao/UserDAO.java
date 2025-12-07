
package com.petadoption.dao;

import com.petadoption.model.User;

import java.util.Optional;

public interface UserDAO {
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    void save(User user);
    boolean verifyPassword(User user, String rawPassword);
}
