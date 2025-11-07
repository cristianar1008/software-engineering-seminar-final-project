package com.authbackend.auth.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StudentRequest {
    private Long personId;
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
}

