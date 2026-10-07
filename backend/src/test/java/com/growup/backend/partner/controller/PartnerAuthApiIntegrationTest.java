package com.growup.backend.partner.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.growup.backend.global.security.AuthPrincipal;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.global.security.Role;
import com.growup.backend.partner.domain.Partner;
import com.growup.backend.partner.domain.PartnerAccount;
import com.growup.backend.partner.repository.PartnerAccountRepository;
import com.growup.backend.partner.repository.PartnerRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PartnerAuthApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PartnerAccountRepository partnerAccountRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    @Test
    void activePartnerAccountCanLoginAndReceivesPartnerAccessToken() throws Exception {
        PartnerAccount account = saveAccount(true);

        String responseBody = mockMvc.perform(post("/api/v1/partner-auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLoginBody()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.expiresIn").value(3600))
                .andExpect(jsonPath("$.data.user").doesNotExist())
                .andExpect(jsonPath("$.data.partner").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String accessToken = JsonPath.read(responseBody, "$.data.accessToken");
        Authentication authentication = jwtTokenProvider.getAuthentication(accessToken);
        AuthPrincipal principal = (AuthPrincipal) authentication.getPrincipal();

        assertThat(principal.accountId()).isEqualTo(account.getId());
        assertThat(principal.role()).isEqualTo(Role.PARTNER);
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_PARTNER");

        PartnerAccount savedAccount = partnerAccountRepository.findById(account.getId())
                .orElseThrow();
        assertThat(savedAccount.getPasswordHash()).isNotEqualTo("password123!");
        assertThat(passwordEncoder.matches(
                "password123!",
                savedAccount.getPasswordHash()
        )).isTrue();
    }

    @Test
    void unknownLoginIdReturnsInvalidPartnerLogin() throws Exception {
        mockMvc.perform(post("/api/v1/partner-auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLoginBody()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INVALID_PARTNER_LOGIN"));
    }

    @Test
    void wrongPasswordReturnsInvalidPartnerLogin() throws Exception {
        saveAccount(true);

        mockMvc.perform(post("/api/v1/partner-auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "loginId": "cafe01",
                                  "password": "wrong-password"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INVALID_PARTNER_LOGIN"));
    }

    @Test
    void inactiveAccountReturnsInactivePartnerAccount() throws Exception {
        saveAccount(false);

        mockMvc.perform(post("/api/v1/partner-auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validLoginBody()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INACTIVE_PARTNER_ACCOUNT"));
    }

    @Test
    void missingLoginIdReturnsValidationError() throws Exception {
        expectValidationError("""
                {
                  "password": "password123!"
                }
                """);
    }

    @Test
    void missingPasswordReturnsValidationError() throws Exception {
        expectValidationError("""
                {
                  "loginId": "cafe01"
                }
                """);
    }

    private void expectValidationError(String requestBody) throws Exception {
        mockMvc.perform(post("/api/v1/partner-auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    private PartnerAccount saveAccount(boolean active) {
        Partner partner = partnerRepository.saveAndFlush(
                Partner.create("그루업 테스트 카페")
        );
        return partnerAccountRepository.saveAndFlush(PartnerAccount.create(
                "cafe01",
                passwordEncoder.encode("password123!"),
                active,
                partner
        ));
    }

    private String validLoginBody() {
        return """
                {
                  "loginId": "cafe01",
                  "password": "password123!"
                }
                """;
    }

    private void cleanDatabase() {
        partnerAccountRepository.deleteAll();
        partnerRepository.deleteAll();
    }
}
