package util;

import com.authbackend.auth.util.JwtUtil;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil("DriverMasterSuperUltraSecretKey123456789!");

    @Test
    void generateToken_ShouldReturnToken() {
        String token = jwtUtil.generateToken("user1", "ADMIN");
        assertNotNull(token);
    }

    @Test
    void extractUsername_ShouldReturnCorrectUsername() {
        String token = jwtUtil.generateToken("user1", "ADMIN");
        String username = jwtUtil.extractUsername(token);
        assertEquals("user1", username);
    }

    @Test
    void extractRole_ShouldReturnCorrectRole() {
        String token = jwtUtil.generateToken("user1", "INSTRUCTOR");
        String role = jwtUtil.extractRole(token);
        assertEquals("INSTRUCTOR", role);
    }

    @Test
    void isTokenValid_ShouldReturnTrueForValidToken() {
        String token = jwtUtil.generateToken("user1", "STUDENT");
        assertTrue(jwtUtil.isTokenValid(token, "user1"));
    }

    @Test
    void isTokenValid_ShouldReturnFalseForWrongUser() {
        String token = jwtUtil.generateToken("user1", "STUDENT");
        assertFalse(jwtUtil.isTokenValid(token, "user2"));
    }
}
