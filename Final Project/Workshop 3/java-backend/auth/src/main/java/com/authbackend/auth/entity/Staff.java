package com.authbackend.auth.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Staff")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con Person
    @ManyToOne
    @JoinColumn(name = "person_id", foreignKey = @ForeignKey(value = ConstraintMode.NO_CONSTRAINT))
    private Person person;

    // Relación con TypeStaff
    @ManyToOne
    @JoinColumn(name = "type_staff_id", foreignKey = @ForeignKey(value = ConstraintMode.NO_CONSTRAINT))
    private TypeStaff typeStaff;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(nullable = false)
    private Double salary;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
