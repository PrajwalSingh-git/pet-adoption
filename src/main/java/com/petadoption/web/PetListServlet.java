package com.petadoption.web;

import com.petadoption.dao.JdbcPetDAO;
import com.petadoption.model.Pet;
import com.petadoption.service.PetService;
import com.petadoption.util.InputValidator;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class PetListServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(PetListServlet.class.getName());
    private PetService petService;

    @Override
    public void init() {
        LOGGER.info("Initializing PetListServlet");
        this.petService = new PetService(new JdbcPetDAO());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String q = req.getParameter("q");
        String type = req.getParameter("type");
        String breed = req.getParameter("breed");
        String ageMinStr = req.getParameter("ageMin");
        String ageMaxStr = req.getParameter("ageMax");
        String pageStr = req.getParameter("page");
        String sizeStr = req.getParameter("size");

        int page = 0;
        int size = 5;

        try {
            page = InputValidator.parsePositiveInt(pageStr, "page", 0);
            size = InputValidator.parsePositiveInt(sizeStr, "size", 5);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Invalid pagination parameters, defaulting to page=0,size=5", e);
        }

        Integer ageMin = null;
        Integer ageMax = null;
        try {
            if (ageMinStr != null && !ageMinStr.isBlank()) {
                ageMin = InputValidator.parsePositiveInt(ageMinStr, "ageMin", 0);
            }
            if (ageMaxStr != null && !ageMaxStr.isBlank()) {
                ageMax = InputValidator.parsePositiveInt(ageMaxStr, "ageMax", 0);
            }
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Invalid age filters", e);
        }

        LOGGER.info(String.format("Listing pets page=%d size=%d type=%s breed=%s ageMin=%s ageMax=%s q=%s",
                page, size, type, breed, ageMin, ageMax, q));

        List<Pet> pets = petService.getPetsPage(type, ageMin, ageMax, breed, q, page, size);
        boolean hasNext = pets.size() == size;

        req.setAttribute("pets", pets);
        req.setAttribute("page", page);
        req.setAttribute("size", size);
        req.setAttribute("hasNext", hasNext);

        req.getRequestDispatcher("/WEB-INF/views/pets.jsp").forward(req, resp);
    }
}
