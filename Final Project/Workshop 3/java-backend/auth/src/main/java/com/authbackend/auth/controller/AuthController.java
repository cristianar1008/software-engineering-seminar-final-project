package com.authbackend.auth.controller;

import com.authbackend.auth.dto.RegisterRequest;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.repository.PersonRepository;
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

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, PersonRepository personRepository, AuthService authService ) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.personRepository = personRepository;
        this.authService = authService;
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

            // ✅ Buscar el usuario completo
            Person person = personRepository.findByIdentificationNumber(Long.parseLong(identificationNumber))
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // ✅ Generar token JWT
            String token = jwtUtil.generateToken(authentication.getName());

            // ✅ Preparar respuesta sin incluir contraseña
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", person.getId());
            userData.put("identificationTypeId", person.getIdentificationType());
            userData.put("identificationNumber", person.getIdentificationNumber());
            userData.put("firstName", person.getFirstName());
            userData.put("lastName", person.getLastName());
            userData.put("email", person.getEmail());
            userData.put("phone", person.getPhone());
            userData.put("address", person.getAddress());
            userData.put("bloodType", person.getBloodType());
            userData.put("eps", person.getEps());

            // ✅ Devolver token + datos del usuario
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
