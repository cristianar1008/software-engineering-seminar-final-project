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
import java.util.stream.Collectors;

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

    // ✅ CREATE
    public StaffResponseDTO createStaff(StaffRequest request) {
        // 1. Buscar Persona
        Person person = personRepository.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con ID: " + request.getPersonId()));

        // 2. Buscar Tipo Staff
        TypeStaff typeStaff = typeStaffRepository.findById(request.getTypeStaffId())
                .orElseThrow(() -> new RuntimeException("Tipo de Staff no encontrado con ID: " + request.getTypeStaffId()));

        // 3. Validar duplicados (Opcional)
        if (staffRepository.existsByPerson(person)) {
            throw new RuntimeException("Esta persona ya tiene un contrato activo.");
        }

        // 4. Guardar Entidad
        Staff staff = new Staff();
        staff.setPerson(person);
        staff.setTypeStaff(typeStaff);
        staff.setHireDate(request.getHireDate());
        staff.setSalary(request.getSalary());

        Staff savedStaff = staffRepository.save(staff);

        // 5. Convertir a DTO (AQUÍ EVITAMOS EL ERROR DE RESPUESTA VACÍA)
        return toResponse(savedStaff);
    }

    // ✅ READ ALL
    public List<StaffResponseDTO> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    // ✅ READ ONE
    public StaffResponseDTO getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Staff no encontrado"));
        return toResponse(staff);
    }

    // ✅ UPDATE
    public StaffResponseDTO updateStaff(Long id, StaffRequest request) {
         Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff no encontrado"));
                
         // Actualizamos solo si cambiaron los IDs, sino mantenemos los actuales
         if (!staff.getPerson().getId().equals(request.getPersonId())) {
             Person p = personRepository.findById(request.getPersonId())
                 .orElseThrow(() -> new RuntimeException("Persona no encontrada"));
             staff.setPerson(p);
         }
         
         if (!staff.getTypeStaff().getId().equals(request.getTypeStaffId())) {
             TypeStaff ts = typeStaffRepository.findById(request.getTypeStaffId())
                 .orElseThrow(() -> new RuntimeException("Tipo Staff no encontrado"));
             staff.setTypeStaff(ts);
         }

         staff.setHireDate(request.getHireDate());
         staff.setSalary(request.getSalary());
         
         return toResponse(staffRepository.save(staff));
    }
    
    // ✅ DELETE
    public void deleteStaff(Long id) {
        staffRepository.deleteById(id);
    }

    // --- MÉTODO MÁGICO PARA LLENAR TU DTO EXISTENTE ---
    private StaffResponseDTO toResponse(Staff staff) {
        StaffResponseDTO dto = new StaffResponseDTO();
        dto.setId(staff.getId());
        
        // Datos planos del DTO que ya tienes
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
}