package com.authbackend.auth.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdministratorResponseDTO {
    private Long id;
    private Long personId;
    private String personFirstName;
    private String personLastName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
