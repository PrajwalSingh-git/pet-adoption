
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
        if (!email.contains("@") || !email.contains(".")) {
            throw new ValidationException("Invalid email format.");
        }
    }

    public static void requireMinLength(String value, String fieldName, int min) throws ValidationException {
        requireNonEmpty(value, fieldName);
        if (value.length() < min) {
            throw new ValidationException(fieldName + " must be at least " + min + " characters.");
        }
    }

    public static int parsePositiveInt(String value, String fieldName, int defaultVal) throws ValidationException {
        if (value == null || value.isEmpty()) return defaultVal;
        try {
            int parsed = Integer.parseInt(value);
            if (parsed < 0) throw new NumberFormatException();
            return parsed;
        } catch (NumberFormatException e) {
            throw new ValidationException(fieldName + " must be a non-negative integer.");
        }
    }
}
