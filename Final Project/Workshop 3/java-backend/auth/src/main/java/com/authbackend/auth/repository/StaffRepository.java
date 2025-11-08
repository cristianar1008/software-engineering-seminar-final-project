package com.authbackend.auth.repository;

import com.authbackend.auth.entity.Person;
import com.authbackend.auth.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    boolean existsByPerson(Person person);
    Staff findByPerson(Person person);
}
