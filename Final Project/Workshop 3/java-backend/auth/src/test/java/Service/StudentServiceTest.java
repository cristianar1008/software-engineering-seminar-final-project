package Service;

import com.authbackend.auth.dto.StudentRequest;
import com.authbackend.auth.dto.StudentResponseDTO;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.entity.Student;
import com.authbackend.auth.repository.PersonRepository;
import com.authbackend.auth.repository.StudentRepository;
import com.authbackend.auth.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para StudentService.
 */
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private PersonRepository personRepository;

    @InjectMocks
    private StudentService studentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /**
     * Prueba la creación de un estudiante.
     */
    @Test
    void createStudent_ShouldReturnStudent() {
        Person person = new Person();
        person.setId(1L);
        person.setFirstName("Alice");
        person.setLastName("Smith");

        StudentRequest request = new StudentRequest();
        request.setPersonId(1L);
        request.setEnrollmentDate(LocalDate.now());
        request.setStatus("ACTIVE");
        request.setGradeLevel("10");
        request.setLicenseCategory("B");
        request.setTheoryHoursCompleted(10);
        request.setPracticeHoursCompleted(5);
        request.setTheoryHoursRequired(20);
        request.setPracticeHoursRequired(10);
        request.setGuardianName("Bob Smith");
        request.setGuardianPhone("123456789");

        Student savedStudent = new Student();
        savedStudent.setId(1L);
        savedStudent.setPerson(person);
        savedStudent.setEnrollmentDate(request.getEnrollmentDate());
        savedStudent.setStatus(request.getStatus());

        when(personRepository.findById(1L)).thenReturn(Optional.of(person));
        when(studentRepository.save(any(Student.class))).thenReturn(savedStudent);

        Student result = studentService.createStudent(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(person, result.getPerson());
    }

    /**
     * Prueba la obtención de todos los estudiantes.
     */
    @Test
    void getAllStudents_ShouldReturnListOfStudents() {
        Student student = new Student();
        student.setId(1L);
        student.setPerson(new Person());

        when(studentRepository.findAll()).thenReturn(List.of(student));

        List<StudentResponseDTO> list = studentService.getAllStudents();

        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getId());
    }

    /**
     * Prueba la obtención de un estudiante por ID.
     */
    @Test
    void getStudentById_ShouldReturnStudentResponse() {
        Student student = new Student();
        student.setId(1L);
        student.setPerson(new Person());

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        StudentResponseDTO response = studentService.getStudentById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    /**
     * Prueba la actualización de un estudiante.
     */
    @Test
    void updateStudent_ShouldReturnUpdatedStudentResponse() {
        Student student = new Student();
        student.setId(1L);
        student.setPerson(new Person());

        Person person = new Person();
        person.setId(2L);

        StudentRequest request = new StudentRequest();
        request.setPersonId(2L);
        request.setEnrollmentDate(LocalDate.now());
        request.setStatus("ACTIVE");
        request.setGradeLevel("11");
        request.setLicenseCategory("B");
        request.setTheoryHoursCompleted(15);
        request.setPracticeHoursCompleted(7);
        request.setTheoryHoursRequired(20);
        request.setPracticeHoursRequired(10);
        request.setGuardianName("Bob Smith");
        request.setGuardianPhone("123456789");

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(personRepository.findById(2L)).thenReturn(Optional.of(person));
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        StudentResponseDTO response = studentService.updateStudent(1L, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(person, student.getPerson());
    }

    /**
     * Prueba la eliminación de un estudiante existente.
     */
    @Test
    void deleteStudent_ShouldCallRepositoryDelete() {
        when(studentRepository.existsById(1L)).thenReturn(true);
        doNothing().when(studentRepository).deleteById(1L);

        assertDoesNotThrow(() -> studentService.deleteStudent(1L));
        verify(studentRepository, times(1)).deleteById(1L);
    }

    /**
     * Prueba la eliminación de un estudiante que no existe.
     */
    @Test
    void deleteStudent_NonExisting_ShouldThrowException() {
        when(studentRepository.existsById(1L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> studentService.deleteStudent(1L));

        assertEquals("Estudiante no encontrado con id: 1", exception.getMessage());
    }
}
