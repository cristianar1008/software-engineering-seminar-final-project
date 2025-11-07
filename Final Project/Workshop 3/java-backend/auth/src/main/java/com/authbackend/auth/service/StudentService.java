package com.authbackend.auth.service;

import com.authbackend.auth.dto.StudentRequest;
import com.authbackend.auth.dto.StudentResponseDTO;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.entity.Student;
import com.authbackend.auth.repository.PersonRepository;
import com.authbackend.auth.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final PersonRepository personRepository;

    public StudentService(StudentRepository studentRepository,
                          PersonRepository personRepository) {
        this.studentRepository = studentRepository;
        this.personRepository = personRepository;
    }

    private StudentResponseDTO toResponse(Student student) {
        StudentResponseDTO dto = new StudentResponseDTO();

        dto.setId(student.getId());
        dto.setEnrollmentDate(student.getEnrollmentDate());
        dto.setStatus(student.getStatus());
        dto.setGradeLevel(student.getGradeLevel());
        dto.setLicenseCategory(student.getLicenseCategory());
        dto.setTheoryHoursCompleted(student.getTheoryHoursCompleted());
        dto.setPracticeHoursCompleted(student.getPracticeHoursCompleted());
        dto.setTheoryHoursRequired(student.getTheoryHoursRequired());
        dto.setPracticeHoursRequired(student.getPracticeHoursRequired());
        dto.setGuardianName(student.getGuardianName());
        dto.setGuardianPhone(student.getGuardianPhone());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setUpdatedAt(student.getUpdatedAt());

        // Datos de persona
        Person p = student.getPerson();
        dto.setPersonId(p.getId());
        dto.setIdentificationNumber(p.getIdentificationNumber());
        dto.setFirstName(p.getFirstName());
        dto.setLastName(p.getLastName());
        dto.setEmail(p.getEmail());
        dto.setPhone(p.getPhone());

        return dto;
    }

    // ✅ CREATE
    public Student createStudent(StudentRequest request) {

        Person person = personRepository.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con id: " + request.getPersonId()));

        Student student = new Student();
        student.setPerson(person);
        student.setEnrollmentDate(request.getEnrollmentDate());
        student.setStatus(request.getStatus());
        student.setGradeLevel(request.getGradeLevel());
        student.setLicenseCategory(request.getLicenseCategory());
        student.setTheoryHoursCompleted(request.getTheoryHoursCompleted());
        student.setPracticeHoursCompleted(request.getPracticeHoursCompleted());
        student.setTheoryHoursRequired(request.getTheoryHoursRequired());
        student.setPracticeHoursRequired(request.getPracticeHoursRequired());
        student.setGuardianName(request.getGuardianName());
        student.setGuardianPhone(request.getGuardianPhone());

        return studentRepository.save(student);
    }

    // ✅ READ ALL
    public List<StudentResponseDTO> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ✅ READ ONE
    public StudentResponseDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado con id: " + id));

        return toResponse(student);
    }


    // ✅ UPDATE
    public StudentResponseDTO updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado con id: " + id));

        Person person = personRepository.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con id: " + request.getPersonId()));

        student.setPerson(person);
        student.setEnrollmentDate(request.getEnrollmentDate());
        student.setStatus(request.getStatus());
        student.setGradeLevel(request.getGradeLevel());
        student.setLicenseCategory(request.getLicenseCategory());
        student.setTheoryHoursCompleted(request.getTheoryHoursCompleted());
        student.setPracticeHoursCompleted(request.getPracticeHoursCompleted());
        student.setTheoryHoursRequired(request.getTheoryHoursRequired());
        student.setPracticeHoursRequired(request.getPracticeHoursRequired());
        student.setGuardianName(request.getGuardianName());
        student.setGuardianPhone(request.getGuardianPhone());

        Student updated = studentRepository.save(student);

        return toResponse(updated);
    }

    // ✅ DELETE
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Estudiante no encontrado con id: " + id);
        }
        studentRepository.deleteById(id);
    }
}

