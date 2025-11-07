package com.authbackend.auth.controller;

import com.authbackend.auth.dto.RegisterRequest;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ✅ CREATE
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            Person saved = userService.registerUser(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Usuario registrado exitosamente",
                    "user", Map.of(
                            "id", saved.getId(),
                            "identificationNumber", saved.getIdentificationNumber(),
                            "firstName", saved.getFirstName(),
                            "lastName", saved.getLastName(),
                            "email", saved.getEmail()
                    )
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ READ — Get all
    @GetMapping("/all")
    public ResponseEntity<List<Person>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ READ — Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ UPDATE
    @PutMapping("update/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody RegisterRequest request) {

        try {
            Person updated = userService.updateUser(id, request);
            return ResponseEntity.ok(Map.of(
                    "message", "Usuario actualizado exitosamente",
                    "user", updated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ DELETE
    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "Usuario eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ EXTRA — Buscar por número de identificación
    @GetMapping("/identification/{number}")
    public ResponseEntity<?> getByIdentificationNumber(@PathVariable Long number) {
        try {
            return ResponseEntity.ok(userService.getByIdentificationNumber(number));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
