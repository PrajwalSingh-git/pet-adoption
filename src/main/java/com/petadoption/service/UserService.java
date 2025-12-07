package com.petadoption.service;

import com.petadoption.dao.UserDAO;
import com.petadoption.exception.ValidationException;
import com.petadoption.model.Adopter;
import com.petadoption.model.User;
import com.petadoption.util.InputValidator;
import com.petadoption.util.PasswordUtil;

import java.util.Optional;

public class UserService {

    private final UserDAO userDAO;

    public UserService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    public User registerAdopter(String fullName, String email, String rawPassword) throws ValidationException {
        InputValidator.requireNonEmpty(fullName, "Full name");
        InputValidator.requireEmail(email);
        InputValidator.requireNonEmpty(rawPassword, "Password");

        if (userDAO.findByEmail(email).isPresent()) {
            throw new ValidationException("Email already registered.");
        }

        String hash = PasswordUtil.hashPassword(rawPassword);
        Adopter adopter = new Adopter(null, email, hash, fullName);
        userDAO.save(adopter);
        return adopter;
    }

    public Optional<User> authenticate(String email, String password) throws ValidationException {
        InputValidator.requireEmail(email);
        InputValidator.requireNonEmpty(password, "Password");

        Optional<User> userOpt = userDAO.findByEmail(email);
        if (userOpt.isPresent() && userDAO.verifyPassword(userOpt.get(), password)) {
            return userOpt;
        }
        return Optional.empty();
    }
}
