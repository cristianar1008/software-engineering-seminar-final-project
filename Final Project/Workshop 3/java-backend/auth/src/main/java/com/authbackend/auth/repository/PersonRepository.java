package com.authbackend.auth.repository;

import com.authbackend.auth.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    Optional<Person> findByIdentificationNumber(Long identificationNumber);
}
