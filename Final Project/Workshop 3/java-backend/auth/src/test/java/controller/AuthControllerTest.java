package controller;
import com.authbackend.auth.controller.AuthController;
import com.authbackend.auth.entity.Person;
import com.authbackend.auth.entity.Staff;
import com.authbackend.auth.repository.AdministratorRepository;
import com.authbackend.auth.repository.PersonRepository;
import com.authbackend.auth.repository.StaffRepository;
import com.authbackend.auth.repository.StudentRepository;
import com.authbackend.auth.service.AuthService;
import com.authbackend.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas unitarias para AuthController.
 */
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private PersonRepository personRepository;
    @Mock
    private AuthService authService;
    @Mock
    private AdministratorRepository administratorRepository;
    @Mock
    private StaffRepository staffRepository;
    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    /**
     * Prueba el endpoint de test.
     */
    @Test
    void testEndpoint_ShouldReturnMessage() throws Exception {
        mockMvc.perform(get("/api/auth/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Backend is running!"));
    }



    /**
     * Prueba login con credenciales inválidas.
     */
    @Test
    void login_InvalidCredentials_ShouldReturn401() throws Exception {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(mock(AuthenticationException.class));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identificationNumber\":\"123\", \"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }
}
