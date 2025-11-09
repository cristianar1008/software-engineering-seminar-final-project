## Project Description

This repository contains the **backend developed in Java with Spring Boot**, responsible for providing a secure and scalable **REST API** that communicates with a **MySQL** database.  

The application implements authentication using **JWT (JSON Web Token)**, user management, and modules for students and administrative staff.  

It also includes **unit tests with JUnit 5 and Mockito**, along with the **database SQL script**.  

The project additionally features a **Python backend built with FastAPI**, which handles the **core business logic**, and an **Angular frontend** that delivers a **dynamic and interactive web interface** for end users.


---

## Backend Auth Java Spring Boot

The backend implements a **modular architecture** with controllers, services, and repositories, allowing secure CRUD operations.  
It features **JWT-based authentication** and **role validation** to protect the endpoints.  

### Includes functionalities for:
- User registration and management  
- Student and staff administration  
- Security with Spring Security and JWT tokens  
- Automated unit testing  
- MySQL database connection using JPA  

---

## Technologies Used

| Component | Technology |
|------------|-------------|
| Language | Java 17 |
| Main Framework | Spring Boot 3 |
| Security | Spring Security + JWT |
| Database | MySQL |
| ORM | Spring Data JPA |
| Testing | JUnit 5 and Mockito |
| Build Tool | Maven |

---

## Prerequisites

Before running the application, make sure you have installed:

- **Java 17** or higher  
- **Maven 3.9+**  
- **MySQL** running locally or remotely  
- **IntelliJ IDEA** or any IDE compatible with Spring Boot  
- **Postman** (optional, for testing the endpoints)

---


## Installation and Execution

### 1️ Clone the repository
```bash
git clone [https://github.com/tu-usuario/driver-master-backend.git](https://github.com/cristianar1008/software-engineering-seminar-final-project.git)
cd Final Project/Workshop 3
```

### 2. Configure the MySQL database
1. Create a MySQL database called `DriverMaster`.
2. In the `application.properties` or `application.yml` file, update the
3. credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/DriverMaster
   spring.datasource.username=tu_usuario
   spring.datasource.password=tu_contraseña
   spring.jpa.hibernate.ddl-auto=update
   ```
---

### 3️ Compile the project
```bash
mvn clean install
```

### 4️ Run the application
Run the main class:
```bash
AuthBackendApplication
```

Or from the terminal:
```bash
mvn spring-boot:run
```

The application will be available at:
```
http://localhost:8083
```

---

##  Unit Tests

The **unit tests** are located in the following directory:
```
src/test/java/
```

Para ejecutarlas:
```bash
mvn test
```

---

## Database Script

The project includes an SQL script with the MySQL database structure required for the application.

It must be run before the system starts for the first time.

---

## Endpoints Principales

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/user/register` | Register a new user |
| GET | `/api/user/all` | Get all users |
| PUT | `/api/user/update/{id}` | Update a user |
| DELETE | `/api/user/delete/{id}` | Delete a user |
| POST | `/api/staff/register` | Register administrative staff |
| POST | `/api/student/register` | Register a student |

---

## Autors

**Developed by:** Cristian Parra
**Language:** Java 17
**Framework:** Spring Boot 3
**Database:** MySQL

---

