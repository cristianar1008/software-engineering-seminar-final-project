package com.authbackend.auth.repository;

import com.authbackend.auth.entity.TypeStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TypeStaffRepository extends JpaRepository<TypeStaff, Long> {}

