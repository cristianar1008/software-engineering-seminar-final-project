package com.authbackend.auth.controller;

import com.authbackend.auth.dto.StudentRequest;
import com.authbackend.auth.dto.StudentResponseDTO;
import com.authbackend.auth.entity.Student;
import com.authbackend.auth.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // ✅ CREATE
    @PostMapping("/register")
    public ResponseEntity<?> create(@RequestBody StudentRequest request) {
        try {
            Student saved = studentService.createStudent(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Estudiante creado exitosamente",
                    "id", saved.getId()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ READ ALL
    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // ✅ READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(studentService.getStudentById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }



    // ✅ UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody StudentRequest request) {
        try {
            StudentResponseDTO updated = studentService.updateStudent(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.ok(Map.of("message", "Estudiante eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}