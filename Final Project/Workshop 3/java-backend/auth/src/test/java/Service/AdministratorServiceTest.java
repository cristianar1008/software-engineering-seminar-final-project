package Service;

import com.authbackend.auth.dto.AdministratorRequest;
import com.authbackend.auth.dto.AdministratorResponseDTO;
import com.authbackend.auth.entity.Administrator;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.repository.AdministratorRepository;
import com.authbackend.auth.repository.PersonRepository;
import com.authbackend.auth.service.AdministratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para la clase AdministratorService.
 * Se utilizan objetos simulados (mocks) para evitar la conexión a la base de datos real.
 * Cada prueba valida una funcionalidad específica del servicio.
 */
class AdministratorServiceTest {

    @Mock
    private AdministratorRepository administratorRepository;

    @Mock
    private PersonRepository personRepository;

    @InjectMocks
    private AdministratorService administratorService;

    private Person person;
    private Administrator admin;

    /**
     * Configura los datos de prueba antes de cada test.
     */
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        person = new Person();
        person.setId(1L);
        person.setFirstName("John");
        person.setLastName("Doe");

        admin = new Administrator();
        admin.setId(10L);
        admin.setPerson(person);
    }

    /**
     * Verifica la creación de un administrador nuevo.
     */
    @Test
    void testCreateAdministrator() {
        AdministratorRequest request = new AdministratorRequest();
        request.setPersonId(1L);

        when(personRepository.findById(1L)).thenReturn(Optional.of(person));
        when(administratorRepository.save(any(Administrator.class))).thenReturn(admin);

        AdministratorResponseDTO response = administratorService.createAdministrator(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("John", response.getPersonFirstName());
        verify(administratorRepository, times(1)).save(any(Administrator.class));
    }

    /**
     * Verifica la obtención de un administrador por su ID.
     */
    @Test
    void testGetAdministratorById() {
        when(administratorRepository.findById(10L)).thenReturn(Optional.of(admin));

        AdministratorResponseDTO response = administratorService.getAdministratorById(10L);

        assertNotNull(response);
        assertEquals("John", response.getPersonFirstName());
    }

    /**
     * Verifica la obtención de todos los administradores registrados.
     */
    @Test
    void testGetAllAdministrators() {
        when(administratorRepository.findAll()).thenReturn(List.of(admin));

        List<AdministratorResponseDTO> result = administratorService.getAllAdministrators();

        assertEquals(1, result.size());
        assertEquals("Doe", result.get(0).getPersonLastName());
    }

    /**
     * Verifica la actualización de los datos de un administrador.
     */
    @Test
    void testUpdateAdministrator() {
        AdministratorRequest request = new AdministratorRequest();
        request.setPersonId(1L);

        when(administratorRepository.findById(10L)).thenReturn(Optional.of(admin));
        when(personRepository.findById(1L)).thenReturn(Optional.of(person));
        when(administratorRepository.save(any(Administrator.class))).thenReturn(admin);

        AdministratorResponseDTO response = administratorService.updateAdministrator(10L, request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        verify(administratorRepository, times(1)).save(any(Administrator.class));
    }

    /**
     * Verifica la eliminación correcta de un administrador existente.
     */
    @Test
    void testDeleteAdministrator() {
        when(administratorRepository.existsById(10L)).thenReturn(true);
        doNothing().when(administratorRepository).deleteById(10L);

        assertDoesNotThrow(() -> administratorService.deleteAdministrator(10L));
        verify(administratorRepository, times(1)).deleteById(10L);
    }

    /**
     * Verifica el comportamiento al intentar eliminar un administrador que no existe.
     */
    @Test
    void testDeleteAdministratorNotFound() {
        when(administratorRepository.existsById(99L)).thenReturn(false);
        assertThrows(RuntimeException.class, () -> administratorService.deleteAdministrator(99L));
    }
}
