package com.authbackend.auth.controller;

import com.authbackend.auth.dto.StaffRequest;
import com.authbackend.auth.dto.StaffResponseDTO;
import com.authbackend.auth.service.StaffService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    // ✅ CREATE
    @PostMapping("/register")
    public ResponseEntity<?> create(@RequestBody StaffRequest request) {
        try {
            StaffResponseDTO saved = staffService.createStaff(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Staff creado exitosamente",
                    "staff", saved
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ READ ALL
    @GetMapping("/all")
    public ResponseEntity<List<StaffResponseDTO>> getAll() {
        List<StaffResponseDTO> staffList = staffService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }

    // ✅ READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        try {
            StaffResponseDTO staff = staffService.getStaffById(id);
            return ResponseEntity.ok(staff);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody StaffRequest request) {
        try {
            StaffResponseDTO updated = staffService.updateStaff(id, request);
            return ResponseEntity.ok(Map.of(
                    "message", "Staff actualizado exitosamente",
                    "staff", updated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            staffService.deleteStaff(id);
            return ResponseEntity.ok(Map.of("message", "Staff eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
