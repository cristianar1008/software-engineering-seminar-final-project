package com.authbackend.auth.controller;

import com.authbackend.auth.dto.AdministratorRequest;
import com.authbackend.auth.dto.AdministratorResponseDTO;
import com.authbackend.auth.service.AdministratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdministratorController {

    private final AdministratorService administratorService;

    public AdministratorController(AdministratorService administratorService) {
        this.administratorService = administratorService;
    }

    // ✅ CREATE
    @PostMapping("/register")
    public ResponseEntity<?> create(@RequestBody AdministratorRequest request) {
        try {
            AdministratorResponseDTO saved = administratorService.createAdministrator(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Administrador creado exitosamente",
                    "admin", saved
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ READ ALL
    @GetMapping("/all")
    public ResponseEntity<List<AdministratorResponseDTO>> getAll() {
        return ResponseEntity.ok(administratorService.getAllAdministrators());
    }

    // ✅ READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        try {
            AdministratorResponseDTO admin = administratorService.getAdministratorById(id);
            return ResponseEntity.ok(admin);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody AdministratorRequest request) {
        try {
            AdministratorResponseDTO updated = administratorService.updateAdministrator(id, request);
            return ResponseEntity.ok(Map.of(
                    "message", "Administrador actualizado exitosamente",
                    "admin", updated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            administratorService.deleteAdministrator(id);
            return ResponseEntity.ok(Map.of("message", "Administrador eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
