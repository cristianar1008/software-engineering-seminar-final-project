package com.authbackend.auth.service;

import com.authbackend.auth.dto.RegisterRequest;
import com.authbackend.auth.entity.IdentificationType;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.repository.IdentificationTypeRepository;
import com.authbackend.auth.repository.PersonRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final PersonRepository personRepository;
    private final IdentificationTypeRepository typeRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(PersonRepository personRepository, 
                       IdentificationTypeRepository typeRepository, 
                       PasswordEncoder passwordEncoder) {
        this.personRepository = personRepository;
        this.typeRepository = typeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ CREATE (Registro de usuario)
    public Person registerUser(RegisterRequest request) {
        if (personRepository.findByIdentificationNumber(request.getIdentificationNumber()).isPresent()) {
            throw new RuntimeException("El usuario ya existe con ese número de identificación");
        }

        // <--- 4. USARLO: Buscar el tipo real en la BD
        IdentificationType idType = typeRepository.findById(request.getIdentificationTypeId())
                .orElseThrow(() -> new RuntimeException("Tipo de identificación no encontrado"));

        Person person = new Person();
        person.setIdentificationType(idType); // <--- 5. Asignar el objeto real
        
        person.setIdentificationNumber(request.getIdentificationNumber());
        person.setFirstName(request.getFirstName());
        person.setLastName(request.getLastName());
        person.setPassword(passwordEncoder.encode(request.getPassword()));
        person.setEmail(request.getEmail());
        person.setPhone(request.getPhone());
        person.setAddress(request.getAddress());
        person.setBloodType(request.getBloodType());
        person.setEps(request.getEps());

        return personRepository.save(person);
    }

    // ✅ READ — Obtener todos
    public List<Person> getAllUsers() {
        return personRepository.findAll();
    }

    // ✅ READ — Obtener uno por ID
    public Person getUserById(Long id) {
        return personRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    // ✅ UPDATE — Actualizar usuario
    public Person updateUser(Long id, RegisterRequest request) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));

        person.setIdentificationNumber(request.getIdentificationNumber());
        person.setFirstName(request.getFirstName());
        person.setLastName(request.getLastName());

        // ✅ solo encriptar si cambia la contraseña
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            person.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        person.setEmail(request.getEmail());
        person.setPhone(request.getPhone());
        person.setAddress(request.getAddress());
        person.setBloodType(request.getBloodType());
        person.setEps(request.getEps());
        person.setIdentificationType(new IdentificationType(request.getIdentificationTypeId()));

        return personRepository.save(person);
    }

    // ✅ DELETE — Eliminar usuario
    public void deleteUser(Long id) {
        if (!personRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con id: " + id);
        }
        personRepository.deleteById(id);
    }

    // ✅ EXTRA — Buscar por número de identificación
    public Person getByIdentificationNumber(Long identificationNumber) {
        return personRepository
                .findByIdentificationNumber(identificationNumber)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con número de identificación: " + identificationNumber));
    }
}
