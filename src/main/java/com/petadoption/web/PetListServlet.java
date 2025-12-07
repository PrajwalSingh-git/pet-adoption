package com.petadoption.web;

import com.petadoption.dao.JdbcPetDAO;
import com.petadoption.service.PetService;
import com.petadoption.model.Pet;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

public class PetListServlet extends HttpServlet {

    private PetService petService;

    @Override
    public void init() {
        this.petService = new PetService(new JdbcPetDAO());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String search = req.getParameter("q");
        List<Pet> pets = (search == null || search.isEmpty())
                ? petService.getAvailablePets()
                : petService.searchPetsByName(search);

        req.setAttribute("pets", pets);
        req.getRequestDispatcher("/WEB-INF/views/pets.jsp").forward(req, resp);
    }
}
