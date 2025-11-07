package com.authbackend.auth.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class StudentResponseDTO {

    private Long id;

    // Datos planos de Person
    private Long personId;
    private Long identificationNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    // Datos del Student
    private LocalDate enrollmentDate;
    private String status;
    private String gradeLevel;
    private String licenseCategory;
    private Integer theoryHoursCompleted;
    private Integer practiceHoursCompleted;
    private Integer theoryHoursRequired;
    private Integer practiceHoursRequired;
    private String guardianName;
    private String guardianPhone;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
