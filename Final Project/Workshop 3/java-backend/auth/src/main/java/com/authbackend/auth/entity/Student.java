package com.authbackend.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Student")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con Person
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Column(nullable = false)
    private String status = "Active";

    @Column(name = "grade_level")
    private String gradeLevel;

    @Column(name = "license_category")
    private String licenseCategory;

    @Column(name = "theory_hours_completed")
    private Integer theoryHoursCompleted = 0;

    @Column(name = "practice_hours_completed")
    private Integer practiceHoursCompleted = 0;

    @Column(name = "theory_hours_required")
    private Integer theoryHoursRequired = 20;

    @Column(name = "practice_hours_required")
    private Integer practiceHoursRequired = 20;

    @Column(name = "guardian_name")
    private String guardianName;

    @Column(name = "guardian_phone")
    private String guardianPhone;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

