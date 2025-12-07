
package com.petadoption.web;

import com.petadoption.dao.JdbcUserDAO;
import com.petadoption.dao.UserDAO;
import com.petadoption.exception.ValidationException;
import com.petadoption.model.User;
import com.petadoption.service.UserService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.logging.Logger;

public class RegisterServlet extends HttpServlet {

    private static final Logger LOGGER = Logger.getLogger(RegisterServlet.class.getName());
    private UserService userService;

    @Override
    public void init() {
        UserDAO userDAO = new JdbcUserDAO();
        this.userService = new UserService(userDAO);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.getRequestDispatcher("/WEB-INF/views/register.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String fullName = req.getParameter("fullName");
        String email = req.getParameter("email");
        String password = req.getParameter("password");

        try {
            User user = userService.registerAdopter(fullName, email, password);
            HttpSession session = req.getSession(true);
            session.setAttribute("loggedInUser", user);
            session.setAttribute("role", user.getRole());
            resp.sendRedirect(req.getContextPath() + "/pets");
        } catch (ValidationException e) {
            LOGGER.warning("Registration validation error: " + e.getMessage());
            req.setAttribute("error", e.getMessage());
            req.getRequestDispatcher("/WEB-INF/views/register.jsp").forward(req, resp);
        }
    }
}
