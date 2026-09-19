package com.familybudget;

import com.familybudget.dto.auth.AuthResponse;
import com.familybudget.dto.auth.RegisterRequest;
import com.familybudget.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class FamilyBudgetApplicationTests {

    @Autowired
    private AuthService authService;

    @Test
    void contextLoads() {
        assertNotNull(authService);
    }

    @Test
    void testRegisterAndTenantCreation() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Alice Doe");
        request.setEmail("alice.doe@example.com");
        request.setPassword("securePassword123");
        request.setFamilyName("Doe Family");
        request.setCurrency("USD");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("Alice Doe", response.getName());
        assertEquals("alice.doe@example.com", response.getEmail());
        assertEquals("Doe Family", response.getFamilyName());
        assertNotNull(response.getFamilyId());
    }
}
