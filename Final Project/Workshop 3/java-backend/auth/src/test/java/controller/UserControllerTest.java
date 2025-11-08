package controller;
import com.authbackend.auth.controller.UserController;
import com.authbackend.auth.dto.RegisterRequest;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.service.UserService;
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
 * Pruebas unitarias para UserController.
 */
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        objectMapper = new ObjectMapper();
    }

    /**
     * Prueba registrar un usuario exitosamente.
     */
    @Test
    void register_ShouldReturnOk() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setIdentificationNumber(12345L);
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john@example.com");
        request.setPassword("pass123");

        Person saved = new Person();
        saved.setId(1L);
        saved.setIdentificationNumber(12345L);
        saved.setFirstName("John");
        saved.setLastName("Doe");
        saved.setEmail("john@example.com");

        when(userService.registerUser(any(RegisterRequest.class))).thenReturn(saved);

        mockMvc.perform(post("/api/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Usuario registrado exitosamente"))
                .andExpect(jsonPath("$.user.id").value(1))
                .andExpect(jsonPath("$.user.firstName").value("John"));

        verify(userService, times(1)).registerUser(any(RegisterRequest.class));
    }

    /**
     * Prueba registrar un usuario con error.
     */
    @Test
    void register_WhenError_ShouldReturnBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setIdentificationNumber(12345L);

        when(userService.registerUser(any(RegisterRequest.class)))
                .thenThrow(new RuntimeException("Error al registrar"));

        mockMvc.perform(post("/api/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Error al registrar"));
    }

    /**
     * Prueba obtener todos los usuarios.
     */
    @Test
    void getAll_ShouldReturnList() throws Exception {
        Person user = new Person();
        user.setId(1L);
        user.setFirstName("John");

        when(userService.getAllUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/user/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].firstName").value("John"));
    }

    /**
     * Prueba obtener un usuario por ID exitosamente.
     */
    @Test
    void getUserById_ShouldReturnUser() throws Exception {
        Person user = new Person();
        user.setId(1L);
        user.setFirstName("John");

        when(userService.getUserById(1L)).thenReturn(user);

        mockMvc.perform(get("/api/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    /**
     * Prueba obtener un usuario inexistente.
     */
    @Test
    void getUserById_NotFound_ShouldReturnBadRequest() throws Exception {
        when(userService.getUserById(1L))
                .thenThrow(new RuntimeException("No encontrado"));

        mockMvc.perform(get("/api/user/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("No encontrado"));
    }

    /**
     * Prueba actualizar un usuario exitosamente.
     */
    @Test
    void updateUser_ShouldReturnOk() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setIdentificationNumber(12345L);
        request.setFirstName("John Updated");

        Person updated = new Person();
        updated.setId(1L);
        updated.setFirstName("John Updated");

        when(userService.updateUser(eq(1L), any(RegisterRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/user/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Usuario actualizado exitosamente"))
                .andExpect(jsonPath("$.user.id").value(1))
                .andExpect(jsonPath("$.user.firstName").value("John Updated"));
    }

    /**
     * Prueba eliminar un usuario exitosamente.
     */
    @Test
    void deleteUser_ShouldReturnOk() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/user/delete/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Usuario eliminado exitosamente"));

        verify(userService, times(1)).deleteUser(1L);
    }

    /**
     * Prueba eliminar un usuario inexistente.
     */
    @Test
    void deleteUser_NotFound_ShouldReturnBadRequest() throws Exception {
        doThrow(new RuntimeException("No encontrado")).when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/user/delete/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("No encontrado"));
    }

    /**
     * Prueba buscar usuario por número de identificación exitosamente.
     */
    @Test
    void getByIdentificationNumber_ShouldReturnUser() throws Exception {
        Person user = new Person();
        user.setId(1L);
        user.setIdentificationNumber(12345L);

        when(userService.getByIdentificationNumber(12345L)).thenReturn(user);

        mockMvc.perform(get("/api/user/identification/12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.identificationNumber").value(12345));
    }

    /**
     * Prueba buscar usuario por número de identificación inexistente.
     */
    @Test
    void getByIdentificationNumber_NotFound_ShouldReturnBadRequest() throws Exception {
        when(userService.getByIdentificationNumber(12345L))
                .thenThrow(new RuntimeException("No encontrado"));

        mockMvc.perform(get("/api/user/identification/12345"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("No encontrado"));
    }
}
