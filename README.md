🐾 Pet Adoption System

A Java Web Application using Servlets, JSP, JDBC, and MySQL

The Pet Adoption System is a full-stack Java web application designed to simplify the process of finding and adopting pets. It provides role-based access for Users and Admins, supports pet management, adoption workflow, image uploads, filtering, pagination, and robust validation.
The project follows the MVC architecture and uses DAO, JSP views, and Servlet controllers to ensure clean separation of responsibilities.

This README explains the project structure, setup instructions, implemented features, architecture, and how the system aligns with the Java Web-Based Projects Marking Rubric.

📌 Table of Contents

Introduction
Features
Tech Stack
Project Architecture
Folder Structure
Database Schema
Setup Instructions
Default Credentials
Screenshots
Rubric Mapping
Future Improvements
Contributors
License

🐶 Introduction

The Pet Adoption System enables users to browse pets, view details, and submit adoption requests.
Admins can manage pets, approve/reject requests, and maintain the system using an integrated dashboard.

This project demonstrates strong application of:
✔ Java Servlets
✔ JSP + JSTL
✔ JDBC DAO pattern
✔ MVC architecture
✔ Client + server-side validation
✔ Session-based authentication
✔ Web application design principles

✨ Features
👤 User Features

Create account, login, logout
Browse all pets
Advanced search & filtering (type, age, status)
Pagination for pet lists
View pet profiles
Submit adoption requests
View request status
Responsive and user-friendly UI

🛠 Admin Features

Admin dashboard
Add new pets
Edit pet information
Delete pets
Upload pet images
Manage adoption requests (approve/reject)
View all system data
Validation on every form
Role-based access protection

🔐 Security Features

Session-based authentication
Access restrictions for admin routes
Input sanitization
SQL injection prevention via PreparedStatement
Automatic session invalidation on logout

📦 Additional Enhancements (Innovation)

Image upload and preview
User-friendly form validations
Clean navigation bar shared across JSP pages
Advanced search logic
Pagination (improved performance for larger data)

🧱 Tech Stack

Frontend:
HTML5
CSS3
JSP + JSTL
JavaScript (validation & UI enhancements)

Backend:
Java Servlets
JDBC
DAO Pattern
MVC Architecture
Database:
MySQL

Schema included in docs/schema.sql
Build & Deployment:
Apache Tomcat
Maven
Java 8+

🧭 Project Architecture
The project uses a clean Three-Layer MVC Architecture:

1. Presentation Layer (View)
JSP files
Uses JSTL and Expression Language for dynamic rendering
Displays forms, tables, pet lists, dashboards

2. Controller Layer (Servlets)
Handles request/response workflow
Processes user actions
Validates input
Forwards to JSP or redirects (PRG pattern)

3. Data Access Layer (DAO)
Encapsulates all SQL operations
Uses JDBC + PreparedStatements
Ensures clean database separation

📂 Folder Structure
pet-adoption/
│
├── docs/
│   └── schema.sql
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com.petadoption/
│       │       ├── controllers/    # Servlets
│       │       ├── dao/            # Database operations
│       │       ├── models/         # POJOs
│       │       └── utils/          # DB connection
│       │
│       └── webapp/
│           ├── assets/             # Images, CSS, JS
│           ├── views/              # JSP pages
│           ├── WEB-INF/
│           │   └── web.xml
│           └── index.jsp
│
├── pom.xml
└── README.md

🗄 Database Schema
The full schema is provided in:
docs/schema.sql

Tables include:
users
pets
adoption_requests
admins
(optional) pet_images
Foreign keys ensure relational integrity.

🚀 Setup Instructions
1. Clone the Repository
   git clone https://github.com/PrajwalSingh-git/pet-adoption.git
   cd pet-adoption
   
2. Import as Maven Project
Open in:
IntelliJ IDEA
Eclipse
VS Code (with Java Extensions)

3. Create the Database
   CREATE DATABASE pet_adoption;
   USE pet_adoption;
Then run the SQL in docs/schema.sql.

4. Configure Database Connection

Edit your DB credentials in:
src/main/java/com/petadoption/utils/DBConnection.java

5. Build the Project
   mvn clean install
   
7. Deploy to Tomcat
Copy target/pet-adoption.war to Tomcat’s webapps/ folder.

8. Run the Application
Visit:http://localhost:8080/pet-adoption/

🔑 Default Credentials
Admin Login
Username: admin
Password: admin123

User Login
Create a new user via signup or preload via SQL.

📈 Future Improvements

Optional enhancements for future versions:
Email notifications for adoption approvals
Admin analytics dashboard
REST API version of the system
Cloud-based image storage
CI/CD pipeline
JUnit testing suite

📜 License
This project is licensed under the MIT License.
