package com.petadoption.dao;

import com.petadoption.model.Admin;
import com.petadoption.model.Adopter;
import com.petadoption.model.User;
import com.petadoption.util.DBConnectionUtil;
import com.petadoption.util.PasswordUtil;

import java.sql.*;
import java.util.Optional;

public class JdbcUserDAO implements UserDAO {

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUser(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching user by email", e);
        }
        return Optional.empty();
    }

    @Override
    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUser(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching user by id", e);
        }
        return Optional.empty();
    }

    @Override
    public void save(User user) {
        String sql = "INSERT INTO users(email, password_hash, full_name, role) VALUES (?,?,?,?)";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, user.getEmail());
            ps.setString(2, user.getPasswordHash());
            ps.setString(3, user.getFullName());
            ps.setString(4, user.getRole());

            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    user.setId(keys.getLong(1));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error saving user", e);
        }
    }

    @Override
    public boolean verifyPassword(User user, String rawPassword) {
        return PasswordUtil.matches(rawPassword, user.getPasswordHash());
    }

    private User mapRowToUser(ResultSet rs) throws SQLException {
        Long id = rs.getLong("id");
        String email = rs.getString("email");
        String passwordHash = rs.getString("password_hash");
        String fullName = rs.getString("full_name");
        String role = rs.getString("role");

        if ("ADMIN".equalsIgnoreCase(role)) {
            return new Admin(id, email, passwordHash, fullName);
        } else {
            return new Adopter(id, email, passwordHash, fullName);
        }
    }
}
