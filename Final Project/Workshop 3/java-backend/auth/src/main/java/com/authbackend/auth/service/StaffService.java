package com.authbackend.auth.service;

import com.authbackend.auth.dto.StaffRequest;
import com.authbackend.auth.dto.StaffResponseDTO;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.entity.Staff;
import com.authbackend.auth.entity.TypeStaff;
import com.authbackend.auth.repository.PersonRepository;
import com.authbackend.auth.repository.StaffRepository;
import com.authbackend.auth.repository.TypeStaffRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StaffService {

    private final StaffRepository staffRepository;
    private final PersonRepository personRepository;
    private final TypeStaffRepository typeStaffRepository;

    public StaffService(StaffRepository staffRepository,
                        PersonRepository personRepository,
                        TypeStaffRepository typeStaffRepository) {
        this.staffRepository = staffRepository;
        this.personRepository = personRepository;
        this.typeStaffRepository = typeStaffRepository;
    }

    // ✅ Convertir Staff → StaffResponseDTO
    private StaffResponseDTO toResponse(Staff staff) {
        StaffResponseDTO dto = new StaffResponseDTO();

        dto.setId(staff.getId());
        dto.setPersonId(staff.getPerson().getId());
        dto.setPersonFirstName(staff.getPerson().getFirstName());
        dto.setPersonLastName(staff.getPerson().getLastName());

        dto.setTypeStaffId(staff.getTypeStaff().getId());
        dto.setTypeStaffName(staff.getTypeStaff().getType());

        dto.setHireDate(staff.getHireDate());
        dto.setSalary(staff.getSalary());

        dto.setCreatedAt(staff.getCreatedAt());
        dto.setUpdatedAt(staff.getUpdatedAt());

        return dto;
    }

    // ✅ CREATE
    public StaffResponseDTO createStaff(StaffRequest request) {

        Person person = personRepository.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con id: " + request.getPersonId()));

        TypeStaff typeStaff = typeStaffRepository.findById(request.getTypeStaffId())
                .orElseThrow(() -> new RuntimeException("Tipo de staff no encontrado con id: " + request.getTypeStaffId()));

        Staff staff = new Staff();
        staff.setPerson(person);
        staff.setTypeStaff(typeStaff);
        staff.setHireDate(request.getHireDate());
        staff.setSalary(request.getSalary());

        Staff saved = staffRepository.save(staff);

        return toResponse(saved);
    }

    // ✅ READ ALL
    public List<StaffResponseDTO> getAllStaff() {
        return staffRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ✅ READ ONE
    public StaffResponseDTO getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff no encontrado con id: " + id));

        return toResponse(staff);
    }

    // ✅ UPDATE
    public StaffResponseDTO updateStaff(Long id, StaffRequest request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff no encontrado con id: " + id));

        Person person = personRepository.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con id: " + request.getPersonId()));

        TypeStaff typeStaff = typeStaffRepository.findById(request.getTypeStaffId())
                .orElseThrow(() -> new RuntimeException("Tipo de staff no encontrado con id: " + request.getTypeStaffId()));

        staff.setPerson(person);
        staff.setTypeStaff(typeStaff);
        staff.setHireDate(request.getHireDate());
        staff.setSalary(request.getSalary());

        Staff updated = staffRepository.save(staff);

        return toResponse(updated);
    }

    // ✅ DELETE
    public void deleteStaff(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new RuntimeException("Staff no encontrado con id: " + id);
        }
        staffRepository.deleteById(id);
    }
}
