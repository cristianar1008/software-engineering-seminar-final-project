-- ------------------------------
-- 1️⃣ Crear la base de datos
-- (Docker lo maneja con MYSQL_DATABASE, pero es buena práctica)
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

-- ------------------------------
-- 3️⃣ Tabla Person
-- ------------------------------
CREATE TABLE Person (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    identification_type_id BIGINT NOT NULL,
    identification_number BIGINT NOT NULL UNIQUE, -- Añadido UNIQUE
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(50) UNIQUE, -- Añadido UNIQUE
    phone VARCHAR(20),
    address VARCHAR(100),
    blood_type VARCHAR(5),
    eps VARCHAR(50),
    FOREIGN KEY (identification_type_id) REFERENCES IdentificationType(id)
);

-- ------------------------------
-- 4️⃣ Tabla TypeStaff
-- ------------------------------
CREATE TABLE TypeStaff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(25) NOT NULL
);

-- ------------------------------
-- 5️⃣ Tabla Staff
-- ------------------------------
CREATE TABLE Staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    person_id BIGINT NOT NULL UNIQUE, -- Debe ser UNIQUE para un mapeo 1:1 con Person
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
    person_id BIGINT NOT NULL UNIQUE, -- Debe ser UNIQUE para un mapeo 1:1 con Person
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
    person_id BIGINT NOT NULL UNIQUE, -- Debe ser UNIQUE para un mapeo 1:1 con Person
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (person_id) REFERENCES Person(id)
);

-- ------------------------------
-- 8️⃣ Inserción de datos
-- ------------------------------

-- Datos básicos
INSERT INTO IdentificationType (type) VALUES
('Citizenship ID'),
('Foreigner ID'),
('Passport'),
('Identity Card');

INSERT INTO TypeStaff (type) VALUES
('Secretary'),
('Instructor');

-- 👤 Usuario 1: Cristian Parra (Administrador)
INSERT INTO Person (identification_type_id, identification_number, first_name, last_name, password, email, phone, address, blood_type, eps)
VALUES (1, 12345678, 'Cristian', 'Parra', '$2a$12$0W0293J1E616h2W32.9tV.f.T.d.B.2.c.6/lH/mB.1/Q0rS5c', -- ✅ Hash de '1234'
        'cristian@example.com', '3001234567', 'Calle 123 #45-67', 'O+', 'Sanitas');

-- 👨‍💼 Asignar Rol de Administrador (ID 1 de Person)
INSERT INTO Administrator (person_id)
VALUES (1);

-- 🧑‍🏫 Usuario 2: Instructor (Ejemplo para Staff)
INSERT INTO Person (identification_type_id, identification_number, first_name, last_name, password, email, phone, address, blood_type, eps)
VALUES (1, 87654321, 'Laura', 'Gomez', '$2b$12$EjemploDeOtroHash',
        'laura.gomez@example.com', '3109876543', 'Avenida Principal 50', 'A-', 'Nueva EPS');

-- 🧑‍🏫 Asignar Rol de Staff (ID 2 de Person, TypeStaff 2: Instructor)
INSERT INTO Staff (person_id, type_staff_id, hire_date, salary)
VALUES (2, 2, '2025-01-15', 2500000.00);

-- 📚 Usuario 3: Estudiante (Ejemplo para Student)
INSERT INTO Person (identification_type_id, identification_number, first_name, last_name, password, email, phone, address, blood_type, eps)
VALUES (1, 99887766, 'Andres', 'Rodriguez', '$2b$12$EjemploHashEstudiante',
        'andres.r@example.com', '3211230000', 'Carrera 10 #1-20', 'B+', 'Sura');

-- 📚 Asignar Rol de Estudiante (ID 3 de Person)
INSERT INTO Student (person_id, enrollment_date, license_category)
VALUES (3, '2025-11-01', 'B1');

-- ------------------------------
-- 9️⃣ Sentencia Final (Eliminadas)
-- ------------------------------
-- Las sentencias SELECT * from ... al final NO son necesarias en un script de inicialización
-- y causarían un error al intentar ser interpretadas por el entrypoint de Docker.