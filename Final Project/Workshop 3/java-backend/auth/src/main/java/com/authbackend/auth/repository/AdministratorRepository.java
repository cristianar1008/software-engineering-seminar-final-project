package com.authbackend.auth.repository;

import com.authbackend.auth.entity.Administrator;
import com.authbackend.auth.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministratorRepository extends JpaRepository<Administrator, Long> {
    boolean existsByPerson(Person person);
}

