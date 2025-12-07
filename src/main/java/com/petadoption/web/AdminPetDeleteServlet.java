
package com.petadoption.web;

import com.petadoption.dao.JdbcPetDAO;
import com.petadoption.dao.PetDAO;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

public class AdminPetDeleteServlet extends HttpServlet {

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
        Long id = Long.valueOf(req.getParameter("id"));
        petDAO.delete(id);
        resp.sendRedirect(req.getContextPath() + "/admin");
    }
}
