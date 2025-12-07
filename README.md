# Pet Adoption – Java MVC Version

This is a Java Servlet + JSP implementation of a Pet Adoption web application.
It demonstrates:

- Core Java OOP (inheritance, polymorphism, collections)
- MVC with Servlets (controllers) and JSP (views)
- DAO pattern using JDBC
- Session-based authentication with `HttpSession`

## Build & Run

1. Create a MySQL database `pet_adoption` and run `docs/schema.sql`.
2. Update DB credentials in `DBConnectionUtil`.
3. Build:

   ```bash
   mvn clean package
   ```

4. Deploy the generated WAR to a Jakarta Servlet container (Tomcat 10+).
5. Open in browser: `http://localhost:8080/pet-adoption-java/login`
