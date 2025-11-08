package controller;

import com.authbackend.auth.controller.AdministratorController;
import com.authbackend.auth.dto.AdministratorRequest;
import com.authbackend.auth.dto.AdministratorResponseDTO;
import com.authbackend.auth.service.AdministratorService;
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
 * Pruebas unitarias para AdministratorController.
 */
class AdministratorControllerTest {

    @Mock
    private AdministratorService administratorService;

    @InjectMocks
    private AdministratorController administratorController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(administratorController).build();
        objectMapper = new ObjectMapper();
    }

    /**
     * Prueba crear un administrador exitosamente.
     */
    @Test
    void create_ShouldReturnOk() throws Exception {
        AdministratorRequest request = new AdministratorRequest();
        request.setPersonId(1L);

        AdministratorResponseDTO responseDTO = new AdministratorResponseDTO();
        responseDTO.setId(1L);

        when(administratorService.createAdministrator(any(AdministratorRequest.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/admin/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Administrador creado exitosamente"))
                .andExpect(jsonPath("$.admin.id").value(1));

        verify(administratorService, times(1)).createAdministrator(any(AdministratorRequest.class));
    }

    /**
     * Prueba crear un administrador con error.
     */
    @Test
    void create_WhenError_ShouldReturnBadRequest() throws Exception {
        AdministratorRequest request = new AdministratorRequest();
        request.setPersonId(1L);

        when(administratorService.createAdministrator(any(AdministratorRequest.class)))
                .thenThrow(new RuntimeException("Error al crear"));

        mockMvc.perform(post("/api/admin/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Error al crear"));
    }

    /**
     * Prueba obtener todos los administradores.
     */
    @Test
    void getAll_ShouldReturnList() throws Exception {
        AdministratorResponseDTO admin = new AdministratorResponseDTO();
        admin.setId(1L);

        when(administratorService.getAllAdministrators()).thenReturn(List.of(admin));

        mockMvc.perform(get("/api/admin/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    /**
     * Prueba obtener un administrador por ID exitosamente.
     */
    @Test
    void getOne_ShouldReturnAdmin() throws Exception {
        AdministratorResponseDTO admin = new AdministratorResponseDTO();
        admin.setId(1L);

        when(administratorService.getAdministratorById(1L)).thenReturn(admin);

        mockMvc.perform(get("/api/admin/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    /**
     * Prueba obtener un administrador por ID inexistente.
     */
    @Test
    void getOne_NotFound_ShouldReturn404() throws Exception {
        when(administratorService.getAdministratorById(1L))
                .thenThrow(new RuntimeException("No encontrado"));

        mockMvc.perform(get("/api/admin/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No encontrado"));
    }

    /**
     * Prueba actualizar un administrador exitosamente.
     */
    @Test
    void update_ShouldReturnOk() throws Exception {
        AdministratorRequest request = new AdministratorRequest();
        request.setPersonId(1L);

        AdministratorResponseDTO updated = new AdministratorResponseDTO();
        updated.setId(1L);

        when(administratorService.updateAdministrator(eq(1L), any(AdministratorRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/admin/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Administrador actualizado exitosamente"))
                .andExpect(jsonPath("$.admin.id").value(1));
    }

    /**
     * Prueba eliminar un administrador exitosamente.
     */
    @Test
    void delete_ShouldReturnOk() throws Exception {
        doNothing().when(administratorService).deleteAdministrator(1L);

        mockMvc.perform(delete("/api/admin/delete/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Administrador eliminado correctamente"));

        verify(administratorService, times(1)).deleteAdministrator(1L);
    }

    /**
     * Prueba eliminar un administrador inexistente.
     */
    @Test
    void delete_NotFound_ShouldReturn404() throws Exception {
        doThrow(new RuntimeException("No encontrado")).when(administratorService).deleteAdministrator(1L);

        mockMvc.perform(delete("/api/admin/delete/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No encontrado"));
    }
}
