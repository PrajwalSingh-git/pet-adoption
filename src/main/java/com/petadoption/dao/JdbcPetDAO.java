
package com.petadoption.dao;

import com.petadoption.model.*;
import com.petadoption.util.DBConnectionUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

public class JdbcPetDAO implements PetDAO {

    private static final Logger LOGGER = Logger.getLogger(JdbcPetDAO.class.getName());

    @Override
    public List<Pet> findPageFiltered(PetStatus status, PetType type, Integer ageMin, Integer ageMax,
                                      String breed, String nameQuery, int offset, int limit) {
        List<Pet> pets = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT * FROM pets WHERE 1=1");
        java.util.List<Object> params = new java.util.ArrayList<>();

        if (status != null) {
            sql.append(" AND status = ?");
            params.add(status.name());
        }
        if (type != null) {
            sql.append(" AND type = ?");
            params.add(type.name());
        }
        if (ageMin != null) {
            sql.append(" AND age_years >= ?");
            params.add(ageMin);
        }
        if (ageMax != null) {
            sql.append(" AND age_years <= ?");
            params.add(ageMax);
        }
        if (breed != null && !breed.isBlank()) {
            sql.append(" AND LOWER(breed) LIKE ?");
            params.add("%" + breed.toLowerCase() + "%");
        }
        if (nameQuery != null && !nameQuery.isBlank()) {
            sql.append(" AND LOWER(name) LIKE ?");
            params.add("%" + nameQuery.toLowerCase() + "%");
        }

        sql.append(" ORDER BY created_at DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    pets.add(mapRowToPet(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.severe("Error fetching filtered pets: " + e.getMessage());
            throw new RuntimeException("Error fetching pets", e);
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
            LOGGER.severe("Error fetching pet by id: " + e.getMessage());
            throw new RuntimeException("Error fetching pet", e);
        }
        return Optional.empty();
    }

    @Override
    public void save(Pet pet) {
        String sql = "INSERT INTO pets(name, type, breed, age_years, description, image_path, status) " +
                     "VALUES (?,?,?,?,?,?,?)";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, pet.getName());
            ps.setString(2, pet.getType().name());
            ps.setString(3, pet.getBreed());
            ps.setInt(4, pet.getAgeYears());
            ps.setString(5, pet.getDescription());
            ps.setString(6, pet.getImagePath());
            ps.setString(7, pet.getStatus().name());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    pet.setId(keys.getLong(1));
                }
            }
        } catch (SQLException e) {
            LOGGER.severe("Error saving pet: " + e.getMessage());
            throw new RuntimeException("Error saving pet", e);
        }
    }

    @Override
    public void update(Pet pet) {
        String sql = "UPDATE pets SET name=?, type=?, breed=?, age_years=?, description=?, image_path=?, status=? WHERE id=?";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, pet.getName());
            ps.setString(2, pet.getType().name());
            ps.setString(3, pet.getBreed());
            ps.setInt(4, pet.getAgeYears());
            ps.setString(5, pet.getDescription());
            ps.setString(6, pet.getImagePath());
            ps.setString(7, pet.getStatus().name());
            ps.setLong(8, pet.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            LOGGER.severe("Error updating pet: " + e.getMessage());
            throw new RuntimeException("Error updating pet", e);
        }
    }

    @Override
    public void delete(Long id) {
        String sql = "DELETE FROM pets WHERE id=?";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            LOGGER.severe("Error deleting pet: " + e.getMessage());
            throw new RuntimeException("Error deleting pet", e);
        }
    }

    @Override
    public void updateStatus(Long id, PetStatus status) {
        String sql = "UPDATE pets SET status=? WHERE id=?";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setLong(2, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            LOGGER.severe("Error updating pet status: " + e.getMessage());
            throw new RuntimeException("Error updating pet status", e);
        }
    }

    @Override
    public List<Pet> findAll() {
        List<Pet> pets = new ArrayList<>();
        String sql = "SELECT * FROM pets ORDER BY created_at DESC";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                pets.add(mapRowToPet(rs));
            }
        } catch (SQLException e) {
            LOGGER.severe("Error fetching all pets: " + e.getMessage());
            throw new RuntimeException("Error fetching pets", e);
        }
        return pets;
    }

    private Pet mapRowToPet(ResultSet rs) throws SQLException {
        Long id = rs.getLong("id");
        String name = rs.getString("name");
        PetType type = PetType.valueOf(rs.getString("type"));
        String breed = rs.getString("breed");
        int age = rs.getInt("age_years");
        String description = rs.getString("description");
        String imagePath = rs.getString("image_path");
        PetStatus status = PetStatus.valueOf(rs.getString("status"));

        switch (type) {
            case DOG:
                return new Dog(id, name, breed, age, description, imagePath, status);
            case CAT:
                return new Cat(id, name, breed, age, description, imagePath, status);
            default:
                return new Pet(id, name, type, breed, age, description, imagePath, status) {
                    @Override
                    public double getAdoptionFee() { return 1500.0; }
                };
        }
    }
}
