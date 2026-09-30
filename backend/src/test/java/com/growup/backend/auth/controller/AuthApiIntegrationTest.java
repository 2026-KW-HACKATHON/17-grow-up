package com.growup.backend.auth.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    void signupDoesNotIssueTokenAndLoginIssuesBearerAccessToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "loginId": "growup",
                                  "password": "password123",
                                  "nickname": "새싹이"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").isNumber())
                .andExpect(jsonPath("$.data.loginId").value("growup"))
                .andExpect(jsonPath("$.data.nickname").value("새싹이"))
                .andExpect(jsonPath("$.data.characterType").value(
                        org.hamcrest.Matchers.startsWith("TREE_")
                ))
                .andExpect(jsonPath("$.data.accessToken").doesNotExist());

        User savedUser = userRepository.findByLoginId("growup").orElseThrow();
        assertThat(savedUser.getPasswordHash()).isNotEqualTo("password123");
        assertThat(passwordEncoder.matches("password123", savedUser.getPasswordHash())).isTrue();
        assertThat(savedUser.getLastPracticeDate()).isNull();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "loginId": "growup",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.expiresIn").value(3600));
    }

    @Test
    void duplicateLoginIdReturnsBusinessError() throws Exception {
        String signupBody = """
                {
                  "loginId": "growup",
                  "password": "password123",
                  "nickname": "새싹이"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupBody))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("DUPLICATE_LOGIN_ID"))
                .andExpect(jsonPath("$.error.message").value("이미 사용 중인 아이디입니다."));
    }

    @Test
    void signupAcceptsPasswordThatIsExactly72Utf8Bytes() throws Exception {
        String password = "가".repeat(24);

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "loginId": "utf8-limit",
                                  "password": "%s",
                                  "nickname": "새싹이"
                                }
                                """.formatted(password)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        User savedUser = userRepository.findByLoginId("utf8-limit").orElseThrow();
        assertThat(passwordEncoder.matches(password, savedUser.getPasswordHash())).isTrue();
    }

    @Test
    void signupRejectsMultibytePasswordOver72Utf8Bytes() throws Exception {
        String password = "가".repeat(25);

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "loginId": "utf8-over-limit",
                                  "password": "%s",
                                  "nickname": "새싹이"
                                }
                                """.formatted(password)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.error.message")
                        .value("비밀번호는 UTF-8 기준 72바이트 이하여야 합니다."));

        assertThat(userRepository.existsByLoginId("utf8-over-limit")).isFalse();
    }

    @Test
    void loginWithUnknownIdReturnsInvalidLogin() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "loginId": "unknown",
                                  "password": "password123"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INVALID_LOGIN"))
                .andExpect(jsonPath("$.error.message")
                        .value("아이디 또는 비밀번호가 올바르지 않습니다."));
    }

    @Test
    void loginWithWrongPasswordReturnsSameInvalidLogin() throws Exception {
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "loginId": "growup",
                                  "password": "password123",
                                  "nickname": "새싹이"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "loginId": "growup",
                                  "password": "wrongPassword123"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INVALID_LOGIN"))
                .andExpect(jsonPath("$.error.message")
                        .value("아이디 또는 비밀번호가 올바르지 않습니다."));
    }
}
