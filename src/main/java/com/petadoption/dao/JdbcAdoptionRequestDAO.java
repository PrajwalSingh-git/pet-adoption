
package com.petadoption.dao;

import com.petadoption.model.AdoptionRequest;
import com.petadoption.model.AdoptionStatus;
import com.petadoption.util.DBConnectionUtil;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

public class JdbcAdoptionRequestDAO implements AdoptionRequestDAO {

    private static final Logger LOGGER = Logger.getLogger(JdbcAdoptionRequestDAO.class.getName());

    @Override
    public void save(AdoptionRequest request) {
        String sql = "INSERT INTO adoption_requests(pet_id, adopter_id, message, status) VALUES (?,?,?,?)";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, request.getPetId());
            ps.setLong(2, request.getAdopterId());
            ps.setString(3, request.getMessage());
            ps.setString(4, request.getStatus().name());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    request.setId(keys.getLong(1));
                }
            }
        } catch (SQLException e) {
            LOGGER.severe("Error saving adoption request: " + e.getMessage());
            throw new RuntimeException("Error saving adoption request", e);
        }
    }

    @Override
    public Optional<AdoptionRequest> findById(Long id) {
        String sql = "SELECT * FROM adoption_requests WHERE id = ?";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToRequest(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.severe("Error fetching adoption request: " + e.getMessage());
            throw new RuntimeException("Error fetching adoption request", e);
        }
        return Optional.empty();
    }

    @Override
    public void updateStatus(Long id, AdoptionStatus status) {
        String sql = "UPDATE adoption_requests SET status=?, processed_at=CURRENT_TIMESTAMP WHERE id=?";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setLong(2, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            LOGGER.severe("Error updating adoption request status: " + e.getMessage());
            throw new RuntimeException("Error updating adoption request status", e);
        }
    }

    @Override
    public List<AdoptionRequest> findByStatus(AdoptionStatus status) {
        List<AdoptionRequest> list = new ArrayList<>();
        String sql = "SELECT * FROM adoption_requests WHERE status=? ORDER BY requested_at DESC";
        try (Connection conn = DBConnectionUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToRequest(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.severe("Error fetching adoption requests: " + e.getMessage());
            throw new RuntimeException("Error fetching adoption requests", e);
        }
        return list;
    }

    private AdoptionRequest mapRowToRequest(ResultSet rs) throws SQLException {
        AdoptionRequest req = new AdoptionRequest();
        req.setId(rs.getLong("id"));
        req.setPetId(rs.getLong("pet_id"));
        req.setAdopterId(rs.getLong("adopter_id"));
        req.setMessage(rs.getString("message"));
        req.setStatus(AdoptionStatus.valueOf(rs.getString("status")));
        Timestamp r = rs.getTimestamp("requested_at");
        if (r != null) req.setRequestedAt(r.toLocalDateTime());
        Timestamp p = rs.getTimestamp("processed_at");
        if (p != null) req.setProcessedAt(p.toLocalDateTime());
        return req;
    }
}
