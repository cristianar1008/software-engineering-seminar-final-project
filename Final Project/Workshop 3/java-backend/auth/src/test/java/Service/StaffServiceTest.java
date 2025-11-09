package Service;

import com.authbackend.auth.dto.StaffRequest;
import com.authbackend.auth.dto.StaffResponseDTO;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.entity.Staff;
import com.authbackend.auth.entity.TypeStaff;
import com.authbackend.auth.repository.PersonRepository;
import com.authbackend.auth.repository.StaffRepository;
import com.authbackend.auth.repository.TypeStaffRepository;
import com.authbackend.auth.service.StaffService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para StaffService.
 */
class StaffServiceTest {

    @Mock
    private StaffRepository staffRepository;
    @Mock
    private PersonRepository personRepository;
    @Mock
    private TypeStaffRepository typeStaffRepository;

    @InjectMocks
    private StaffService staffService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /**
     * Prueba la creación de un staff.
     */
    @Test
    void createStaff_ShouldReturnStaffResponse() {
        Person person = new Person();
        person.setId(1L);
        person.setFirstName("John");
        person.setLastName("Doe");

        TypeStaff typeStaff = new TypeStaff();
        typeStaff.setId(1L);
        typeStaff.setType("Instructor");

        StaffRequest request = new StaffRequest();
        request.setPersonId(1L);
        request.setTypeStaffId(1L);
        request.setHireDate(LocalDate.now());
        request.setSalary(1000.0);

        Staff savedStaff = new Staff();
        savedStaff.setId(1L);
        savedStaff.setPerson(person);
        savedStaff.setTypeStaff(typeStaff);
        savedStaff.setHireDate(request.getHireDate());
        savedStaff.setSalary(request.getSalary());

        when(personRepository.findById(1L)).thenReturn(Optional.of(person));
        when(typeStaffRepository.findById(1L)).thenReturn(Optional.of(typeStaff));
        when(staffRepository.save(any(Staff.class))).thenReturn(savedStaff);

        StaffResponseDTO response = staffService.createStaff(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("John", response.getPersonFirstName());
        assertEquals("Instructor", response.getTypeStaffName());
    }

    /**
     * Prueba la obtención de todos los staff.
     */
    @Test
    void getAllStaff_ShouldReturnListOfStaff() {
        Staff staff = new Staff();
        staff.setId(1L);
        staff.setPerson(new Person());
        staff.setTypeStaff(new TypeStaff());
        when(staffRepository.findAll()).thenReturn(List.of(staff));

        List<StaffResponseDTO> list = staffService.getAllStaff();

        assertEquals(1, list.size());
    }

    /**
     * Prueba la obtención de un staff por ID.
     */
    @Test
    void getStaffById_ShouldReturnStaffResponse() {
        Staff staff = new Staff();
        staff.setId(1L);
        staff.setPerson(new Person());
        staff.setTypeStaff(new TypeStaff());

        when(staffRepository.findById(1L)).thenReturn(Optional.of(staff));

        StaffResponseDTO response = staffService.getStaffById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    /**
     * Prueba la actualización de un staff.
     */
    @Test
    void updateStaff_ShouldReturnUpdatedStaffResponse() {
        Staff staff = new Staff();
        staff.setId(1L);
        staff.setPerson(new Person());
        staff.setTypeStaff(new TypeStaff());

        Person person = new Person();
        person.setId(2L);
        TypeStaff typeStaff = new TypeStaff();
        typeStaff.setId(2L);

        StaffRequest request = new StaffRequest();
        request.setPersonId(2L);
        request.setTypeStaffId(2L);
        request.setHireDate(LocalDate.now());
        request.setSalary(2000.0);

        when(staffRepository.findById(1L)).thenReturn(Optional.of(staff));
        when(personRepository.findById(2L)).thenReturn(Optional.of(person));
        when(typeStaffRepository.findById(2L)).thenReturn(Optional.of(typeStaff));
        when(staffRepository.save(any(Staff.class))).thenReturn(staff);

        StaffResponseDTO response = staffService.updateStaff(1L, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    /**
     * Prueba la eliminación de un staff.
     */
    @Test
    void deleteStaff_ShouldCallRepositoryDelete() {
        when(staffRepository.existsById(1L)).thenReturn(true);
        doNothing().when(staffRepository).deleteById(1L);

        assertDoesNotThrow(() -> staffService.deleteStaff(1L));
        verify(staffRepository, times(1)).deleteById(1L);
    }

    /**
     * Prueba la eliminación de un staff que no existe.
     */
    @Test
    void deleteStaff_NonExisting_ShouldThrowException() {
        when(staffRepository.existsById(1L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> staffService.deleteStaff(1L));

        assertEquals("Staff no encontrado con id: 1", exception.getMessage());
    }
}