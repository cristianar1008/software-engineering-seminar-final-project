package controller;

import com.authbackend.auth.controller.StudentController;
import com.authbackend.auth.dto.StudentRequest;
import com.authbackend.auth.dto.StudentResponseDTO;
import com.authbackend.auth.entity.Student;
import com.authbackend.auth.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas unitarias para StudentController.
 */
class StudentControllerTest {

    @Mock
    private StudentService studentService;

    @InjectMocks
    private StudentController studentController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(studentController).build();
        objectMapper = new ObjectMapper();
    }

    /**
     * Prueba crear un estudiante exitosamente.
     */
    @Test
    void create_ShouldReturnOk() throws Exception {
        StudentRequest request = new StudentRequest();
        request.setPersonId(1L);
        // Otros campos del request según tu DTO
        request.setStatus("Activo");

        Student student = new Student();
        student.setId(1L);

        when(studentService.createStudent(any(StudentRequest.class))).thenReturn(student);

        mockMvc.perform(post("/api/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Estudiante creado exitosamente"))
                .andExpect(jsonPath("$.id").value(1));

        verify(studentService, times(1)).createStudent(any(StudentRequest.class));
    }

    /**
     * Prueba obtener todos los estudiantes.
     */
    @Test
    void getAll_ShouldReturnList() throws Exception {
        StudentResponseDTO student = new StudentResponseDTO();
        student.setId(1L);

        when(studentService.getAllStudents()).thenReturn(List.of(student));

        mockMvc.perform(get("/api/student/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    /**
     * Prueba obtener un estudiante por ID exitosamente.
     */
    @Test
    void getStudentById_ShouldReturnStudent() throws Exception {
        StudentResponseDTO student = new StudentResponseDTO();
        student.setId(1L);

        when(studentService.getStudentById(1L)).thenReturn(student);

        mockMvc.perform(get("/api/student/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    /**
     * Prueba obtener un estudiante inexistente.
     */
    @Test
    void getStudentById_NotFound_ShouldReturnBadRequest() throws Exception {
        when(studentService.getStudentById(1L))
                .thenThrow(new RuntimeException("No encontrado"));

        mockMvc.perform(get("/api/student/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("No encontrado"));
    }

    /**
     * Prueba actualizar un estudiante exitosamente.
     */
    @Test
    void updateStudent_ShouldReturnOk() throws Exception {
        StudentRequest request = new StudentRequest();
        request.setPersonId(1L);
        request.setStatus("Activo");

        StudentResponseDTO updated = new StudentResponseDTO();
        updated.setId(1L);

        when(studentService.updateStudent(eq(1L), any(StudentRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/student/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    /**
     * Prueba eliminar un estudiante exitosamente.
     */
    @Test
    void deleteStudent_ShouldReturnOk() throws Exception {
        doNothing().when(studentService).deleteStudent(1L);

        mockMvc.perform(delete("/api/student/delete/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Estudiante eliminado correctamente"));

        verify(studentService, times(1)).deleteStudent(1L);
    }

    /**
     * Prueba eliminar un estudiante inexistente.
     */
    @Test
    void deleteStudent_NotFound_ShouldReturn404() throws Exception {
        doThrow(new RuntimeException("No encontrado")).when(studentService).deleteStudent(1L);

        mockMvc.perform(delete("/api/student/delete/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No encontrado"));
    }
}