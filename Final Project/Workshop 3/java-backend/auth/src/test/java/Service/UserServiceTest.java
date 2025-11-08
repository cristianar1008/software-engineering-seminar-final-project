package Service;

import com.authbackend.auth.dto.RegisterRequest;
import com.authbackend.auth.entity.IdentificationType;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.repository.PersonRepository;
import com.authbackend.auth.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para UserService.
 */
class UserServiceTest {

    @Mock
    private PersonRepository personRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /**
     * Prueba el registro de un usuario exitoso.
     */
    @Test
    void registerUser_ShouldReturnSavedPerson() {
        RegisterRequest request = new RegisterRequest();
        request.setIdentificationNumber(123L);
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("password");
        request.setEmail("john@example.com");
        request.setPhone("123456789");
        request.setAddress("Street 123");
        request.setBloodType("O+");
        request.setEps("EPS");
        request.setIdentificationTypeId(1L);

        when(personRepository.findByIdentificationNumber(123L)).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");

        Person savedPerson = new Person();
        savedPerson.setId(1L);
        when(personRepository.save(any(Person.class))).thenReturn(savedPerson);

        Person result = userService.registerUser(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(passwordEncoder).encode("password");
        verify(personRepository).save(any(Person.class));
    }

    /**
     * Prueba registrar un usuario que ya existe.
     */
    @Test
    void registerUser_ExistingUser_ShouldThrowException() {
        RegisterRequest request = new RegisterRequest();
        request.setIdentificationNumber(123L);

        when(personRepository.findByIdentificationNumber(123L)).thenReturn(Optional.of(new Person()));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.registerUser(request));

        assertEquals("El usuario ya existe con ese número de identificación", exception.getMessage());
    }

    /**
     * Prueba obtener todos los usuarios.
     */
    @Test
    void getAllUsers_ShouldReturnList() {
        Person person = new Person();
        person.setId(1L);
        when(personRepository.findAll()).thenReturn(List.of(person));

        List<Person> list = userService.getAllUsers();

        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getId());
    }

    /**
     * Prueba obtener usuario por ID.
     */
    @Test
    void getUserById_ShouldReturnPerson() {
        Person person = new Person();
        person.setId(1L);
        when(personRepository.findById(1L)).thenReturn(Optional.of(person));

        Person result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    /**
     * Prueba obtener usuario por ID inexistente.
     */
    @Test
    void getUserById_NotFound_ShouldThrowException() {
        when(personRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.getUserById(1L));

        assertEquals("Usuario no encontrado con id: 1", exception.getMessage());
    }

    /**
     * Prueba actualizar usuario exitosamente.
     */
    @Test
    void updateUser_ShouldReturnUpdatedPerson() {
        Person person = new Person();
        person.setId(1L);
        person.setPassword("oldPassword");

        RegisterRequest request = new RegisterRequest();
        request.setIdentificationNumber(123L);
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPassword("newPassword");
        request.setEmail("john@example.com");
        request.setPhone("123456789");
        request.setAddress("Street 123");
        request.setBloodType("O+");
        request.setEps("EPS");
        request.setIdentificationTypeId(1L);

        when(personRepository.findById(1L)).thenReturn(Optional.of(person));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedPassword");
        when(personRepository.save(any(Person.class))).thenReturn(person);

        Person result = userService.updateUser(1L, request);

        assertNotNull(result);
        assertEquals(person, result);
        verify(passwordEncoder).encode("newPassword");
        verify(personRepository).save(person);
    }

    /**
     * Prueba eliminar usuario existente.
     */
    @Test
    void deleteUser_ShouldCallRepositoryDelete() {
        when(personRepository.existsById(1L)).thenReturn(true);
        doNothing().when(personRepository).deleteById(1L);

        assertDoesNotThrow(() -> userService.deleteUser(1L));
        verify(personRepository, times(1)).deleteById(1L);
    }

    /**
     * Prueba eliminar usuario inexistente.
     */
    @Test
    void deleteUser_NotFound_ShouldThrowException() {
        when(personRepository.existsById(1L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.deleteUser(1L));

        assertEquals("Usuario no encontrado con id: 1", exception.getMessage());
    }

    /**
     * Prueba obtener usuario por número de identificación.
     */
    @Test
    void getByIdentificationNumber_ShouldReturnPerson() {
        Person person = new Person();
        person.setId(1L);

        when(personRepository.findByIdentificationNumber(123L)).thenReturn(Optional.of(person));

        Person result = userService.getByIdentificationNumber(123L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    /**
     * Prueba obtener usuario por número de identificación inexistente.
     */
    @Test
    void getByIdentificationNumber_NotFound_ShouldThrowException() {
        when(personRepository.findByIdentificationNumber(123L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.getByIdentificationNumber(123L));

        assertEquals("Usuario no encontrado con número de identificación: 123", exception.getMessage());
    }
}
