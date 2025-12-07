package com.petadoption.web;

import com.petadoption.dao.JdbcAdoptionRequestDAO;
import com.petadoption.dao.JdbcPetDAO;
import com.petadoption.service.AdoptionService;
import com.petadoption.model.AdoptionRequest;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

public class AdminDashboardServlet extends HttpServlet {

    private AdoptionService adoptionService;

    @Override
    public void init() {
        this.adoptionService = new AdoptionService(new JdbcAdoptionRequestDAO(), new JdbcPetDAO());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        HttpSession session = req.getSession(false);
        if (session == null || !"ADMIN".equals(session.getAttribute("role"))) {
            resp.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        List<AdoptionRequest> pending = adoptionService.listPendingRequests();
        req.setAttribute("pendingRequests", pending);
        req.getRequestDispatcher("/WEB-INF/views/admin-dashboard.jsp").forward(req, resp);
    }
}
