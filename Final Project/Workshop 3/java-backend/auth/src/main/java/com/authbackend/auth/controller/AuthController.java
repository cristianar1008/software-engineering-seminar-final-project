package com.authbackend.auth.controller;

import com.authbackend.auth.dto.RegisterRequest;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.entity.Staff;
import com.authbackend.auth.repository.PersonRepository;
import com.authbackend.auth.repository.AdministratorRepository;
import com.authbackend.auth.repository.StaffRepository;
import com.authbackend.auth.repository.StudentRepository;
import com.authbackend.auth.service.AuthService;
import com.authbackend.auth.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PersonRepository personRepository;
    private final AuthService authService;
    private final AdministratorRepository administratorRepository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            PersonRepository personRepository,
            AuthService authService,
            AdministratorRepository administratorRepository,
            StaffRepository staffRepository,
            StudentRepository studentRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.personRepository = personRepository;
        this.authService = authService;
        this.administratorRepository = administratorRepository;
        this.staffRepository = staffRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/test")
    public String test() {
        return "Backend is running!";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String identificationNumber = credentials.get("identificationNumber");
            String password = credentials.get("password");

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identificationNumber, password)
            );

            Person person = personRepository.findByIdentificationNumber(Long.parseLong(identificationNumber))
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // ✅ Determinar el rol del usuario según su tipo
            String role = "USER"; // valor por defecto
            if (administratorRepository.existsByPerson(person)) {
                role = "ADMIN";
            } else if (staffRepository.existsByPerson(person)) {
                Staff staff = staffRepository.findByPerson(person);
                if (staff.getTypeStaff().getType().equalsIgnoreCase("Instructor")) {
                    role = "INSTRUCTOR";
                } else if (staff.getTypeStaff().getType().equalsIgnoreCase("Secretaria")) {
                    role = "SECRETARIA";
                } else {
                    role = "STAFF";
                }
            } else if (studentRepository.existsByPerson(person)) {
                role = "STUDENT";
            }

            // ✅ Generar token con el rol
            String token = jwtUtil.generateToken(authentication.getName(), role);

            // ✅ Preparar respuesta
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", person.getId());
            userData.put("firstName", person.getFirstName());
            userData.put("lastName", person.getLastName());
            userData.put("email", person.getEmail());
            userData.put("phone", person.getPhone());
            userData.put("role", role);

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "user", userData
            ));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

}
