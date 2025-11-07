package com.authbackend.auth.service;

import com.authbackend.auth.entity.Person;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import com.authbackend.auth.repository.PersonRepository;

@Service
public class PersonDetailsService implements UserDetailsService {

    private final PersonRepository personRepository;

    public PersonDetailsService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identificationNumberStr) throws UsernameNotFoundException {
        long identificationNumber;
        try {
            identificationNumber = Long.parseLong(identificationNumberStr);
        } catch (NumberFormatException e) {
            throw new UsernameNotFoundException("Número de identificación inválido");
        }

        Person person = personRepository.findByIdentificationNumber(identificationNumber)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        // 🔹 Rol fijo temporal
        String role = "USER";

        return User.builder()
                .username(String.valueOf(person.getIdentificationNumber()))
                .password(person.getPassword()) // encriptada con BCrypt
                .roles(role)
                .build();
    }

}
