package Service;


import com.authbackend.auth.entity.Person;
import com.authbackend.auth.entity.Staff;
import com.authbackend.auth.entity.TypeStaff;
import com.authbackend.auth.repository.*;
import com.authbackend.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para AuthService.
 * Se utilizan mocks de los repositorios para aislar la lógica de negocio.
 */
class AuthServiceTest {

    @Mock
    private PersonRepository personRepository;
    @Mock
    private AdministratorRepository administratorRepository;
    @Mock
    private StaffRepository staffRepository;
    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private AuthService authService;

    /**
     * Inicializa los mocks antes de cada prueba.
     */
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /**
     * Prueba el caso en el que el usuario no existe en la base de datos.
     */
    @Test
    void loadUserByUsername_UserNotFound_ShouldThrowException() {
        when(personRepository.findByIdentificationNumber(123L)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
                authService.loadUserByUsername("123")
        );
    }

    /**
     * Prueba el caso en el que el número de identificación es inválido (no numérico).
     */
    @Test
    void loadUserByUsername_InvalidNumber_ShouldThrowException() {
        assertThrows(UsernameNotFoundException.class, () ->
                authService.loadUserByUsername("abc")
        );
    }

    /**
     * Prueba el caso en el que el usuario es un administrador.
     * Se verifica que el rol asignado sea ROLE_ADMIN.
     */
    @Test
    void loadUserByUsername_AsAdmin_ShouldReturnUserWithAdminRole() {
        Person person = new Person();
        person.setIdentificationNumber(1L);
        person.setPassword("encrypted");

        when(personRepository.findByIdentificationNumber(1L)).thenReturn(Optional.of(person));
        when(administratorRepository.existsByPerson(person)).thenReturn(true);

        UserDetails userDetails = authService.loadUserByUsername("1");

        assertEquals("1", userDetails.getUsername());
        assertEquals("encrypted", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    /**
     * Prueba el caso en el que el usuario es staff con tipo asignado.
     * Se verifica que el rol corresponda al tipo del staff en mayúsculas.
     */
    @Test
    void loadUserByUsername_AsStaffWithType_ShouldReturnUserWithStaffRole() {
        Person person = new Person();
        person.setIdentificationNumber(2L);
        person.setPassword("encrypted");

        TypeStaff typeStaff = new TypeStaff();
        typeStaff.setType("Instructor");

        Staff staff = new Staff();
        staff.setPerson(person);
        staff.setTypeStaff(typeStaff);

        when(personRepository.findByIdentificationNumber(2L)).thenReturn(Optional.of(person));
        when(administratorRepository.existsByPerson(person)).thenReturn(false);
        when(staffRepository.existsByPerson(person)).thenReturn(true);
        when(staffRepository.findByPerson(person)).thenReturn(staff);

        UserDetails userDetails = authService.loadUserByUsername("2");

        assertEquals("2", userDetails.getUsername());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR")));
    }

    /**
     * Prueba el caso en el que el usuario es estudiante.
     * Se verifica que el rol asignado sea ROLE_STUDENT.
     */
    @Test
    void loadUserByUsername_AsStudent_ShouldReturnUserWithStudentRole() {
        Person person = new Person();
        person.setIdentificationNumber(3L);
        person.setPassword("encrypted");

        when(personRepository.findByIdentificationNumber(3L)).thenReturn(Optional.of(person));
        when(administratorRepository.existsByPerson(person)).thenReturn(false);
        when(staffRepository.existsByPerson(person)).thenReturn(false);
        when(studentRepository.existsByPerson(person)).thenReturn(true);

        UserDetails userDetails = authService.loadUserByUsername("3");

        assertEquals("3", userDetails.getUsername());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT")));
    }

    /**
     * Prueba el caso en el que el usuario es staff pero no tiene tipo definido.
     * Se verifica que el rol asignado sea ROLE_STAFF por defecto.
     */
    @Test
    void loadUserByUsername_AsStaffWithoutType_ShouldReturnUserWithDefaultStaffRole() {
        Person person = new Person();
        person.setIdentificationNumber(4L);
        person.setPassword("encrypted");

        Staff staff = new Staff();
        staff.setPerson(person);
        staff.setTypeStaff(null);

        when(personRepository.findByIdentificationNumber(4L)).thenReturn(Optional.of(person));
        when(administratorRepository.existsByPerson(person)).thenReturn(false);
        when(staffRepository.existsByPerson(person)).thenReturn(true);
        when(staffRepository.findByPerson(person)).thenReturn(staff);

        UserDetails userDetails = authService.loadUserByUsername("4");

        assertEquals("4", userDetails.getUsername());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF")));
    }
}
