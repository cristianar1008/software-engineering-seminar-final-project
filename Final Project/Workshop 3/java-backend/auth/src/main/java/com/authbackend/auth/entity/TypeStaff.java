package com.authbackend.auth.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "typestaff")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TypeStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 25)
    private String type;
}
