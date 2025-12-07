
package com.petadoption.web;

import com.petadoption.dao.JdbcAdoptionRequestDAO;
import com.petadoption.dao.JdbcPetDAO;
import com.petadoption.dao.PetDAO;
import com.petadoption.exception.ValidationException;
import com.petadoption.model.User;
import com.petadoption.service.AdoptionService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

public class SubmitAdoptionRequestServlet extends HttpServlet {

    private AdoptionService adoptionService;
    private PetDAO petDAO;

    @Override
    public void init() {
        this.petDAO = new JdbcPetDAO();
        this.adoptionService = new AdoptionService(new JdbcAdoptionRequestDAO(), petDAO);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("loggedInUser") == null) {
            resp.sendRedirect(req.getContextPath() + "/login");
            return;
        }

        String role = (String) session.getAttribute("role");
        if (!"ADOPTER".equals(role)) {
            resp.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        User user = (User) session.getAttribute("loggedInUser");
        Long petId = Long.valueOf(req.getParameter("petId"));
        String message = req.getParameter("message");

        try {
            adoptionService.submitRequest(petId, user.getId(), message);
            resp.sendRedirect(req.getContextPath() + "/pets?success=1");
        } catch (ValidationException e) {
            req.setAttribute("error", e.getMessage());
            req.setAttribute("pet", petDAO.findById(petId).orElse(null));
            req.getRequestDispatcher("/WEB-INF/views/pet-details.jsp").forward(req, resp);
        }
    }
}
