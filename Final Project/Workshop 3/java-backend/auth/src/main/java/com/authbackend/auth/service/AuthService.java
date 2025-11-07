package com.authbackend.auth.service;

import com.authbackend.auth.dto.RegisterRequest;
import com.authbackend.auth.entity.IdentificationType;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.repository.PersonRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(PersonRepository personRepository, PasswordEncoder passwordEncoder) {
        this.personRepository = personRepository;
        this.passwordEncoder = passwordEncoder;
    }

}
