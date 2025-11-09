package util;

import com.authbackend.auth.util.JwtRequestFilter;
import com.authbackend.auth.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class JwtRequestFilterTest {

    @Mock private JwtUtil jwtUtil;
    @Mock private UserDetailsService userDetailsService;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain filterChain;

    private JwtRequestFilter filter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        filter = new JwtRequestFilter(jwtUtil, userDetailsService);
        SecurityContextHolder.clearContext(); // limpiar contexto antes de cada prueba
    }

    @Test
    void doFilter_NoAuthorizationHeader_ShouldCallFilterChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilter(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilter_InvalidToken_ShouldCallFilterChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer token123");
        when(jwtUtil.extractUsername("token123")).thenThrow(new JwtException("Invalid token"));

        filter.doFilter(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilter_ValidToken_ShouldSetAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer token123");
        when(jwtUtil.extractUsername("token123")).thenReturn("user1");
        when(jwtUtil.extractRole("token123")).thenReturn("ADMIN");
        when(jwtUtil.isTokenValid("token123", "user1")).thenReturn(true);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("user1");
        when(userDetailsService.loadUserByUsername("user1")).thenReturn(userDetails);

        filter.doFilter(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("user1", SecurityContextHolder.getContext().getAuthentication().getName());
        assertTrue(SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void doFilter_TokenValidButAuthenticationAlreadySet_ShouldSkip() throws Exception {
        // Preparar contexto con una autenticación ya existente
        SecurityContextHolder.getContext().setAuthentication(mock(org.springframework.security.core.Authentication.class));

        when(request.getHeader("Authorization")).thenReturn("Bearer token123");

        filter.doFilter(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        // No se debe sobrescribir la autenticación existente
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
