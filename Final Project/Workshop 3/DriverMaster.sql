-- ------------------------------
-- 1️⃣ Crear la base de datos
-- ------------------------------
CREATE DATABASE IF NOT EXISTS DriverMaster;
USE DriverMaster;

-- ------------------------------
-- 2️⃣ Tabla IdentificationType
-- ------------------------------
CREATE TABLE IdentificationType (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(25) NOT NULL
);

INSERT INTO IdentificationType (type) VALUES 
('Citizenship ID'),
('Foreigner ID'),
('Passport'),
('Identity Card');

-- ------------------------------
-- 3️⃣ Tabla Person
-- ------------------------------
CREATE TABLE Person (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    identification_type_id BIGINT NOT NULL,
    identification_number BIGINT NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Aumentado por bcrypt
    email VARCHAR(50),
    phone VARCHAR(20),
    address VARCHAR(100),
    blood_type VARCHAR(5),
    eps VARCHAR(50),
    FOREIGN KEY (identification_type_id) REFERENCES IdentificationType(id)
);

INSERT INTO Person (identification_type_id, identification_number, first_name, last_name, password, email, phone, address, blood_type, eps)
VALUES (1, 12345678, 'Cristian', 'Parra', '$2b$12$euCqJ/AL/73wgmgRHd3RHuUAHpJ8bCLQGGsj54Fe8aD96Wasfeb6a', 
        'cristian@example.com', '3001234567', 'Calle 123 #45-67', 'O+', 'Sanitas');

-- ------------------------------
-- 4️⃣ Tabla TypeStaff
-- ------------------------------
CREATE TABLE TypeStaff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(25) NOT NULL
);

INSERT INTO TypeStaff (type) VALUES ('Secretary'), ('Instructor');

-- ------------------------------
-- 5️⃣ Tabla Staff
-- ------------------------------
CREATE TABLE Staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    person_id BIGINT NOT NULL,
    type_staff_id BIGINT NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES Person(id),
    FOREIGN KEY (type_staff_id) REFERENCES TypeStaff(id)
);



-- ------------------------------
-- 6️⃣ Tabla Student
-- ------------------------------
CREATE TABLE Student (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    person_id BIGINT NOT NULL,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    grade_level VARCHAR(20),
    license_category VARCHAR(20),
    theory_hours_completed INT DEFAULT 0,
    practice_hours_completed INT DEFAULT 0,
    theory_hours_required INT DEFAULT 20,
    practice_hours_required INT DEFAULT 20,
    guardian_name VARCHAR(50),
    guardian_phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES Person(id)
);


-- ------------------------------
-- 7️⃣ Tabla Administrator
-- ------------------------------
CREATE TABLE Administrator (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    person_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES Person(id)
);

INSERT INTO Administrator (person_id)
VALUES (1);

Select * from Person;
Select * from staff;
Select * from administrator;
Select* from student;