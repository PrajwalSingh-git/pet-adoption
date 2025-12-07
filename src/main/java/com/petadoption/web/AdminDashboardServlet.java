
package com.petadoption.web;

import com.petadoption.dao.JdbcAdoptionRequestDAO;
import com.petadoption.dao.JdbcPetDAO;
import com.petadoption.model.AdoptionRequest;
import com.petadoption.model.Pet;
import com.petadoption.service.AdoptionService;
import com.petadoption.service.PetService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

public class AdminDashboardServlet extends HttpServlet {

    private AdoptionService adoptionService;
    private PetService petService;

    @Override
    public void init() {
        JdbcPetDAO petDAO = new JdbcPetDAO();
        this.adoptionService = new AdoptionService(new JdbcAdoptionRequestDAO(), petDAO);
        this.petService = new PetService(petDAO);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        if (session == null || !"ADMIN".equals(session.getAttribute("role"))) {
            resp.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        List<AdoptionRequest> pending = adoptionService.listPendingRequests();
        List<Pet> allPets = petService.getAllPets();

        req.setAttribute("pendingRequests", pending);
        req.setAttribute("pets", allPets);
        req.getRequestDispatcher("/WEB-INF/views/admin-dashboard.jsp").forward(req, resp);
    }
}
