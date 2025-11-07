package com.authbackend.auth.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StaffRequest {
    private Long personId;
    private Long typeStaffId;
    private LocalDate hireDate;
    private Double salary;
}
