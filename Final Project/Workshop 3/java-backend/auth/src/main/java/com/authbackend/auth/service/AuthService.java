package com.authbackend.auth.service;

import com.authbackend.auth.entity.Person;
import com.authbackend.auth.entity.Staff;
import com.authbackend.auth.repository.PersonRepository;
import com.authbackend.auth.repository.AdministratorRepository;
import com.authbackend.auth.repository.StaffRepository;
import com.authbackend.auth.repository.StudentRepository;

import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService implements UserDetailsService {

    private final PersonRepository personRepository;
    private final AdministratorRepository administratorRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder; // <-- FALTABA ESTO

    public AuthService(
            PersonRepository personRepository,
            AdministratorRepository administratorRepository,
            StaffRepository staffRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder // <-- FALTABA RECIBIRLO
    ) {
        this.personRepository = personRepository;
        this.administratorRepository = administratorRepository;
        this.staffRepository = staffRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder; // <-- Y FALTABA GUARDARLO
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

        // 🔹 Determinar rol dinámico
        String role = "USER";

        if (administratorRepository.existsByPerson(person)) {
            role = "ADMIN";
        } else if (staffRepository.existsByPerson(person)) {
            Staff staff = staffRepository.findByPerson(person);
            if (staff != null && staff.getTypeStaff() != null) {
                role = staff.getTypeStaff().getType().toUpperCase();
            } else {
                role = "STAFF";
            }
        } else if (studentRepository.existsByPerson(person)) {
            role = "STUDENT";
        }

        System.out.println("Role: " + role);

        return User.builder()
                .username(String.valueOf(person.getIdentificationNumber()))
                .password(person.getPassword()) // BCrypt OK
                .roles(role)
                .build();
    }
}
