package com.petadoption.dao;

import com.petadoption.model.*;
import com.petadoption.util.DBConnectionUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class JdbcPetDAO implements PetDAO {

    @Override
    public List<Pet> findAll() {
        List<Pet> pets = new ArrayList<>();
        String sql = "SELECT * FROM pets";

        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                pets.add(mapRowToPet(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching pets", e);
        }
        return pets;
    }

    @Override
    public List<Pet> findByStatus(PetStatus status) {
        List<Pet> pets = new ArrayList<>();
        String sql = "SELECT * FROM pets WHERE status = ?";

        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, status.name());
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    pets.add(mapRowToPet(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching pets by status", e);
        }
        return pets;
    }

    @Override
    public Optional<Pet> findById(Long id) {
        String sql = "SELECT * FROM pets WHERE id = ?";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToPet(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error fetching pet by id", e);
        }
        return Optional.empty();
    }

    @Override
    public void save(Pet pet) {
        String sql = "INSERT INTO pets(name, type, breed, age_years, description, status) VALUES (?,?,?,?,?,?)";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, pet.getName());
            ps.setString(2, pet.getType().name());
            ps.setString(3, pet.getBreed());
            ps.setInt(4, pet.getAgeYears());
            ps.setString(5, pet.getDescription());
            ps.setString(6, pet.getStatus().name());

            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    pet.setId(keys.getLong(1));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error saving pet", e);
        }
    }

    @Override
    public void updateStatus(Long id, PetStatus status) {
        String sql = "UPDATE pets SET status = ? WHERE id = ?";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, status.name());
            ps.setLong(2, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating pet status", e);
        }
    }

    private Pet mapRowToPet(ResultSet rs) throws SQLException {
        Long id = rs.getLong("id");
        String name = rs.getString("name");
        PetType type = PetType.valueOf(rs.getString("type"));
        String breed = rs.getString("breed");
        int age = rs.getInt("age_years");
        String description = rs.getString("description");
        PetStatus status = PetStatus.valueOf(rs.getString("status"));

        switch (type) {
            case DOG:
                return new Dog(id, name, breed, age, description, status);
            case CAT:
                return new Cat(id, name, breed, age, description, status);
            default:
                return new Pet(id, name, type, breed, age, description, status) {
                    @Override
                    public double getAdoptionFee() {
                        return 1500.0;
                    }
                };
        }
    }
}
