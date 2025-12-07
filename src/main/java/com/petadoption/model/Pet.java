
package com.petadoption.model;

public abstract class Pet {
    private Long id;
    private String name;
    private PetType type;
    private String breed;
    private int ageYears;
    private String description;
    private String imagePath;
    private PetStatus status;

    protected Pet() { }

    protected Pet(Long id, String name, PetType type, String breed,
                  int ageYears, String description, String imagePath, PetStatus status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.breed = breed;
        this.ageYears = ageYears;
        this.description = description;
        this.imagePath = imagePath;
        this.status = status;
    }

    public abstract double getAdoptionFee();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public PetType getType() { return type; }
    public void setType(PetType type) { this.type = type; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public int getAgeYears() { return ageYears; }
    public void setAgeYears(int ageYears) { this.ageYears = ageYears; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public PetStatus getStatus() { return status; }
    public void setStatus(PetStatus status) { this.status = status; }
}
