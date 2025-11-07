package com.authbackend.auth.service;

import com.authbackend.auth.dto.AdministratorRequest;
import com.authbackend.auth.dto.AdministratorResponseDTO;
import com.authbackend.auth.entity.Administrator;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.repository.AdministratorRepository;
import com.authbackend.auth.repository.PersonRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdministratorService {

    private final AdministratorRepository administratorRepository;
    private final PersonRepository personRepository;

    public AdministratorService(AdministratorRepository administratorRepository,
                                PersonRepository personRepository) {
        this.administratorRepository = administratorRepository;
        this.personRepository = personRepository;
    }

    // Convierte entidad → DTO
    private AdministratorResponseDTO toResponse(Administrator admin) {
        AdministratorResponseDTO dto = new AdministratorResponseDTO();
        dto.setId(admin.getId());
        dto.setPersonId(admin.getPerson().getId());
        dto.setPersonFirstName(admin.getPerson().getFirstName());
        dto.setPersonLastName(admin.getPerson().getLastName());
        dto.setCreatedAt(admin.getCreatedAt());
        dto.setUpdatedAt(admin.getUpdatedAt());
        return dto;
    }

    // ✅ CREATE
    public AdministratorResponseDTO createAdministrator(AdministratorRequest request) {
        Person person = personRepository.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con id: " + request.getPersonId()));

        Administrator administrator = new Administrator();
        administrator.setPerson(person);

        Administrator saved = administratorRepository.save(administrator);
        return toResponse(saved);
    }

    // ✅ READ ALL
    public List<AdministratorResponseDTO> getAllAdministrators() {
        return administratorRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ✅ READ ONE
    public AdministratorResponseDTO getAdministratorById(Long id) {
        Administrator admin = administratorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Administrador no encontrado con id: " + id));
        return toResponse(admin);
    }

    // ✅ UPDATE
    public AdministratorResponseDTO updateAdministrator(Long id, AdministratorRequest request) {
        Administrator admin = administratorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Administrador no encontrado con id: " + id));

        Person person = personRepository.findById(request.getPersonId())
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con id: " + request.getPersonId()));

        admin.setPerson(person);
        Administrator updated = administratorRepository.save(admin);
        return toResponse(updated);
    }

    // ✅ DELETE
    public void deleteAdministrator(Long id) {
        if (!administratorRepository.existsById(id)) {
            throw new RuntimeException("Administrador no encontrado con id: " + id);
        }
        administratorRepository.deleteById(id);
    }
}
