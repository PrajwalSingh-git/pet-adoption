🐾 Pet Adoption – Java MVC Web Application

![Java](https://img.shields.io/badge/Java-17+-red.svg)
![Maven](https://img.shields.io/badge/Build-Maven-blue.svg)
![Servlets & JSP](https://img.shields.io/badge/Web-Servlets%20%26%20JSP-brightgreen.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A full **Java-based Pet Adoption System** built using **Servlets, JSP, JDBC, and the DAO pattern**, demonstrating clean **MVC architecture**, **core Java OOP**, and **session-based authentication**.

This project was refactored from a TypeScript/React frontend into a **pure Java server-side implementation** to showcase proficiency in **Core Java concepts, web architecture, and database integration**.


🚀 Features

👤 For Users (Adopters)

- Register as a new user (Adopter)
- Login / Logout with session-based authentication
- View **available pets** for adoption
- Search pets by name
- View detailed information for each pet
- Submit an **adoption request** with a custom message

🛠️ For Admins

- Login as **Admin**
- View list of **pending adoption requests**
- Approve or reject adoption requests
- Automatic pet status updates:
  - `AVAILABLE → PENDING → ADOPTED`
- Manage adoption workflow end-to-end

🔧 Technical & Architectural

- **Java MVC pattern**:
  - Controllers: Java **Servlets**
  - Views: **JSP** pages with JSTL
  - Model: Plain Java domain objects
- **DAO Pattern** with **JDBC** for database access
- **Session Management** via `HttpSession`
- **Input validation** and basic error handling
- **Clear layering**:
  - Controller → Service → DAO → Database


🧱 Tech Stack

- **Language:** Java 17+
- **Web Framework:** Jakarta Servlets & JSP
- **View Layer:** JSP + JSTL
- **Build Tool:** Maven
- **Database:** MySQL (configurable)
- **Persistence:** JDBC with DAO pattern
- **App Server:** Tomcat 10+ or any Jakarta Servlet 5 compatible container

🏗️ Architecture Overview

**High-level flow:**

1. User/Admin sends HTTP request (login, view pets, submit request, etc.)
2. **Servlet** (Controller) handles the request
3. Servlet delegates to a **Service** class (business logic)
4. Service interacts with **DAO** classes to query/update the database via **JDBC**
5. Results are passed to a **JSP view**, which renders HTML for the user

Browser
  ↓
Servlets (Controllers)
  ↓
Services (Business Logic)
  ↓
DAO Layer (JDBC)
  ↓
MySQL Database

📁 Project Structure
pet-adoption/
├── pom.xml
├── docs/
│   └── schema.sql                # Database schema (MySQL)
├── src/
│   └── main/
│       ├── java/
│       │   └── com/petadoption/
│       │       ├── model/        # Domain models & enums
│       │       │   ├── Pet.java
│       │       │   ├── Dog.java
│       │       │   ├── Cat.java
│       │       │   ├── User.java
│       │       │   ├── Admin.java
│       │       │   ├── Adopter.java
│       │       │   ├── AdoptionRequest.java
│       │       │   ├── PetType.java
│       │       │   ├── PetStatus.java
│       │       │   └── AdoptionStatus.java
│       │       ├── dao/          # DAO interfaces + JDBC implementations
│       │       │   ├── PetDAO.java
│       │       │   ├── UserDAO.java
│       │       │   ├── AdoptionRequestDAO.java
│       │       │   ├── JdbcPetDAO.java
│       │       │   ├── JdbcUserDAO.java
│       │       │   └── JdbcAdoptionRequestDAO.java
│       │       ├── service/      # Business logic layer
│       │       │   ├── PetService.java
│       │       │   ├── UserService.java
│       │       │   └── AdoptionService.java
│       │       ├── util/         # Helpers (DB, validation, passwords)
│       │       │   ├── DBConnectionUtil.java
│       │       │   ├── InputValidator.java
│       │       │   └── PasswordUtil.java
│       │       ├── exception/
│       │       │   └── ValidationException.java
│       │       └── web/          # Servlets (Controllers)
│       │           ├── LoginServlet.java
│       │           ├── RegisterServlet.java
│       │           ├── LogoutServlet.java
│       │           ├── PetListServlet.java
│       │           ├── PetDetailsServlet.java
│       │           ├── SubmitAdoptionRequestServlet.java
│       │           ├── AdminDashboardServlet.java
│       │           ├── AdminApproveRequestServlet.java
│       │           └── AdminRejectRequestServlet.java
│       └── webapp/
│           ├── assets/
│           │   └── css/styles.css
│           └── WEB-INF/
│               ├── web.xml
│               └── views/
│                   ├── includes/header.jsp
│                   ├── includes/footer.jsp
│                   ├── login.jsp
│                   ├── register.jsp
│                   ├── pets.jsp
│                   ├── pet-details.jsp
│                   ├── admin-dashboard.jsp
│                   └── error.jsp
└── LICENSE


🗄️ Database Design

The database schema is defined in:

docs/schema.sql

Main Tables

users

id, email, password_hash, full_name, role, created_at

Roles: ADMIN, ADOPTER

pets

id, name, type, breed, age_years, description, status, created_at

Status: AVAILABLE, PENDING, ADOPTED

adoption_requests

id, pet_id, adopter_id, message, status, requested_at, processed_at

Status: PENDING, APPROVED, REJECTED

⚙️ Getting Started

1️⃣ Prerequisites

Java 17+

Maven 3+

MySQL (or compatible database)

Tomcat 10+ (or any Jakarta Servlet 5 compatible server)

2️ Clone the Repository

git clone https://github.com/PrajwalSingh-git/pet-adoption.git
cd pet-adoption

3️⃣ Set Up the Database (MySQL)

Create the database and tables:
mysql -u your_user -p < docs/schema.sql

Update DB credentials in:
src/main/java/com/petadoption/util/DBConnectionUtil.java

private static final String URL      = "jdbc:mysql://localhost:3306/pet_adoption";
private static final String USERNAME = "root";
private static final String PASSWORD = "your_password";

4️⃣ Build the Project

mvn clean package
This will generate a WAR file in the target/ directory
(e.g. pet-adoption-java.war depending on pom.xml configuration).

5️⃣ Deploy to Tomcat

Copy the WAR from target/ into Tomcat’s webapps/ directory.

Start Tomcat.

Visit in your browser:
http://localhost:8080/<context-path>/login

📌 Usage Overview
Register & Login (Adopter)

Open /register to create a new adopter account.

After successful registration, you are logged in and redirected to /pets.

Use /login for returning users.

Browsing Pets

Go to /pets to see all available pets.

Use the search box to filter by pet name.

Click “View details” for more information about a pet.

Request Adoption

On the pet details page (/pet?id=...), if you’re logged in as an Adopter:

Fill in the text area with your message/reason.

Submit the adoption request.

You’ll see a success message when the request is created.

Admin Workflow

Login as an Admin (requires an admin user in the users table).

Visit /admin:

View a table of pending adoption requests.

Approve or reject each request.

Approving/Rejecting:

Updates the request status (APPROVED / REJECTED).

Updates the pet’s status (ADOPTED or back to AVAILABLE).

🎓 Core Java Concepts Demonstrated

This project is intentionally structured to showcase:

✅ Object-Oriented Programming

Inheritance

User → Admin, Adopter

Pet → Dog, Cat

Polymorphism

User#getRole() implemented differently in Admin and Adopter

Pet#getAdoptionFee() implemented differently in Dog and Cat

Encapsulation

Private fields with getters/setters across domain models

✅ Collections & Streams

Use of List<Pet> and List<AdoptionRequest> in DAOs and Services

Filtering and searching via Java Streams in PetService

✅ DAO Pattern & JDBC

PetDAO, UserDAO, AdoptionRequestDAO interfaces

JdbcPetDAO, JdbcUserDAO, JdbcAdoptionRequestDAO implementations using:

PreparedStatement

Proper try-with-resources

Mapping from ResultSet → domain objects

✅ MVC with Servlets & JSP

Controllers: LoginServlet, RegisterServlet, PetListServlet,
PetDetailsServlet, SubmitAdoptionRequestServlet, AdminDashboardServlet, etc.

Views: JSP files under WEB-INF/views using JSTL

Models: Plain Java classes in com.petadoption.model

✅ Session Management & Security Basics

HttpSession used for:

Keeping track of loggedInUser

Storing role (ADMIN / ADOPTER)

Role-based access checks in Admin servlets

✅ Validation & Error Handling

InputValidator for email and non-empty checks

ValidationException for business-rule violations (e.g., pet not available)

User-friendly error messages passed to JSP via request attributes

🧩 Possible Extensions / Roadmap

Some ideas to extend this project:

Add pagination and advanced search filters (type, age, breed)

File upload for pet images

Admin CRUD UI for managing pets

More robust form validation and error pages

Logging (e.g., using java.util.logging or Log4j)

Switch to PostgreSQL or another RDBMS

📄 License

This project is licensed under the MIT License.
See the LICENSE file for details.
