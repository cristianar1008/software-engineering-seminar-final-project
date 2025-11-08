package controller;
import com.authbackend.auth.controller.StaffController;
import com.authbackend.auth.dto.StaffRequest;
import com.authbackend.auth.dto.StaffResponseDTO;
import com.authbackend.auth.service.StaffService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas unitarias para StaffController.
 */
class StaffControllerTest {

    @Mock
    private StaffService staffService;

    @InjectMocks
    private StaffController staffController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(staffController).build();
        objectMapper = new ObjectMapper();
    }


    /**
     * Prueba crear un staff con error.
     */
    @Test
    void create_WhenError_ShouldReturnBadRequest() throws Exception {
        StaffRequest request = new StaffRequest();
        request.setPersonId(1L);

        when(staffService.createStaff(any(StaffRequest.class)))
                .thenThrow(new RuntimeException("Error al crear"));

        mockMvc.perform(post("/api/staff/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Error al crear"));
    }

    /**
     * Prueba obtener todos los staff.
     */
    @Test
    void getAll_ShouldReturnList() throws Exception {
        StaffResponseDTO staff = new StaffResponseDTO();
        staff.setId(1L);

        when(staffService.getAllStaff()).thenReturn(List.of(staff));

        mockMvc.perform(get("/api/staff/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    /**
     * Prueba obtener un staff por ID exitosamente.
     */
    @Test
    void getOne_ShouldReturnStaff() throws Exception {
        StaffResponseDTO staff = new StaffResponseDTO();
        staff.setId(1L);

        when(staffService.getStaffById(1L)).thenReturn(staff);

        mockMvc.perform(get("/api/staff/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    /**
     * Prueba obtener un staff inexistente.
     */
    @Test
    void getOne_NotFound_ShouldReturn404() throws Exception {
        when(staffService.getStaffById(1L))
                .thenThrow(new RuntimeException("No encontrado"));

        mockMvc.perform(get("/api/staff/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No encontrado"));
    }

    /**
     * Prueba actualizar un staff exitosamente.
     */
    @Test
    void update_ShouldReturnOk() throws Exception {
        StaffRequest request = new StaffRequest();
        request.setPersonId(1L);
        request.setTypeStaffId(1L);

        StaffResponseDTO updated = new StaffResponseDTO();
        updated.setId(1L);

        when(staffService.updateStaff(eq(1L), any(StaffRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/staff/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Staff actualizado exitosamente"))
                .andExpect(jsonPath("$.staff.id").value(1));
    }

    /**
     * Prueba eliminar un staff exitosamente.
     */
    @Test
    void delete_ShouldReturnOk() throws Exception {
        doNothing().when(staffService).deleteStaff(1L);

        mockMvc.perform(delete("/api/staff/delete/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Staff eliminado correctamente"));

        verify(staffService, times(1)).deleteStaff(1L);
    }

    /**
     * Prueba eliminar un staff inexistente.
     */
    @Test
    void delete_NotFound_ShouldReturn404() throws Exception {
        doThrow(new RuntimeException("No encontrado")).when(staffService).deleteStaff(1L);

        mockMvc.perform(delete("/api/staff/delete/1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("No encontrado"));
    }
}