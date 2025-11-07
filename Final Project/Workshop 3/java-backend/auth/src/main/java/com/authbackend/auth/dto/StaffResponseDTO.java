package com.authbackend.auth.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class StaffResponseDTO {
    private Long id;

    // Datos del empleado
    private Long personId;
    private String personFirstName;
    private String personLastName;

    // Tipo de staff
    private Long typeStaffId;
    private String typeStaffName;

    private LocalDate hireDate;
    private Double salary;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

