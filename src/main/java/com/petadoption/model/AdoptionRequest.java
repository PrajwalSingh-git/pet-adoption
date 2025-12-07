package com.petadoption.model;

import java.time.LocalDateTime;

public class AdoptionRequest {
    private Long id;
    private Long petId;
    private Long adopterId;
    private String message;
    private AdoptionStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }

    public Long getAdopterId() { return adopterId; }
    public void setAdopterId(Long adopterId) { this.adopterId = adopterId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public AdoptionStatus getStatus() { return status; }
    public void setStatus(AdoptionStatus status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}
