package com.petadoption.util;

import com.petadoption.exception.ValidationException;

public class InputValidator {

    public static void requireNonEmpty(String value, String fieldName) throws ValidationException {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(fieldName + " is required.");
        }
    }

    public static void requireEmail(String email) throws ValidationException {
        requireNonEmpty(email, "Email");
        if (!email.matches("^[\\w._%+-]+@[\\w.-]+\\.[A-Za-z]{2,6}$")) {
            throw new ValidationException("Invalid email format.");
        }
    }
}
