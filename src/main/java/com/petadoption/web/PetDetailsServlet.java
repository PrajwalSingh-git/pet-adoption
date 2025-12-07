
package com.petadoption.web;

import com.petadoption.dao.JdbcPetDAO;
import com.petadoption.dao.PetDAO;
import com.petadoption.model.Pet;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class PetDetailsServlet extends HttpServlet {

    private PetDAO petDAO;

    @Override
    public void init() {
        this.petDAO = new JdbcPetDAO();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String idParam = req.getParameter("id");
        if (idParam == null) {
            resp.sendRedirect(req.getContextPath() + "/pets");
            return;
        }
        Long id = Long.valueOf(idParam);
        Pet pet = petDAO.findById(id).orElseThrow(() -> new RuntimeException("Pet not found"));
        req.setAttribute("pet", pet);
        req.getRequestDispatcher("/WEB-INF/views/pet-details.jsp").forward(req, resp);
    }
}
