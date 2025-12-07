
package com.petadoption.web;

import com.petadoption.dao.JdbcPetDAO;
import com.petadoption.dao.PetDAO;
import com.petadoption.exception.ValidationException;
import com.petadoption.model.*;
import com.petadoption.util.InputValidator;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.UUID;

@MultipartConfig
public class AdminPetCreateServlet extends HttpServlet {

    private PetDAO petDAO;

    @Override
    public void init() {
        this.petDAO = new JdbcPetDAO();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        if (session == null || !"ADMIN".equals(session.getAttribute("role"))) {
            resp.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        req.getRequestDispatcher("/WEB-INF/views/admin-pet-form.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        if (session == null || !"ADMIN".equals(session.getAttribute("role"))) {
            resp.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        req.setCharacterEncoding("UTF-8");

        String name = req.getParameter("name");
        String typeStr = req.getParameter("type");
        String breed = req.getParameter("breed");
        String ageStr = req.getParameter("ageYears");
        String description = req.getParameter("description");
        String statusStr = req.getParameter("status");

        try {
            InputValidator.requireNonEmpty(name, "Name");
            PetType type = PetType.valueOf(typeStr);
            int age = InputValidator.parsePositiveInt(ageStr, "Age", 0);
            PetStatus status = PetStatus.valueOf(statusStr);

            Part imagePart = req.getPart("image");
            String fileName = null;
            if (imagePart != null && imagePart.getSize() > 0) {
                String uploadsDir = getServletContext().getRealPath("/uploads/pets");
                File dir = new File(uploadsDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                String submitted = imagePart.getSubmittedFileName();
                String ext = "";
                if (submitted != null && submitted.contains(".")) {
                    ext = submitted.substring(submitted.lastIndexOf('.'));
                }
                fileName = UUID.randomUUID() + ext;
                File file = new File(dir, fileName);
                Files.copy(imagePart.getInputStream(), file.toPath());
            }

            Pet pet;
            switch (type) {
                case DOG:
                    pet = new Dog(null, name, breed, age, description, fileName, status);
                    break;
                case CAT:
                    pet = new Cat(null, name, breed, age, description, fileName, status);
                    break;
                default:
                    pet = new Pet(null, name, type, breed, age, description, fileName, status) {
                        @Override
                        public double getAdoptionFee() { return 1500.0; }
                    };
            }
            petDAO.save(pet);
            resp.sendRedirect(req.getContextPath() + "/admin");
        } catch (ValidationException | IllegalArgumentException e) {
            req.setAttribute("error", e.getMessage());
            req.getRequestDispatcher("/WEB-INF/views/admin-pet-form.jsp").forward(req, resp);
        }
    }
}
