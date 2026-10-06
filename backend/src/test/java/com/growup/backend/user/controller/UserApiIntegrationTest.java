package com.growup.backend.user.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.global.security.Role;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class UserApiIntegrationTest {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String CURRENT_PASSWORD = "oldPassword123!";
    private static final String NEW_PASSWORD = "newPassword123!";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    void authenticatedUserGetsOwnInformation() throws Exception {
        User user = saveUser(6_900L);

        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(user.getId()))
                .andExpect(jsonPath("$.data.loginId").value("growup"))
                .andExpect(jsonPath("$.data.nickname").value("새싹이"))
                .andExpect(jsonPath("$.data.characterType").value("TREE_A"))
                .andExpect(jsonPath("$.data.characterLevel").value(3))
                .andExpect(jsonPath("$.data.totalCarbonG").value(6_900))
                .andExpect(jsonPath("$.data.convertibleCarbonG").value(300))
                .andExpect(jsonPath("$.data.availablePoints").value(200))
                .andExpect(jsonPath("$.data.totalEarnedPoints").value(500))
                .andExpect(jsonPath("$.data.currentStreak").value(4))
                .andExpect(jsonPath("$.data.longestStreak").value(9));
    }

    @Test
    void authenticatedUserUpdatesNickname() throws Exception {
        User user = saveUser(0L);

        mockMvc.perform(patch("/api/v1/users/me/nickname")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nickname": "그루미"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(user.getId()))
                .andExpect(jsonPath("$.data.nickname").value("그루미"));

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updatedUser.getNickname()).isEqualTo("그루미");
    }

    @Test
    void nicknameShorterThanTwoCharactersReturnsValidationError() throws Exception {
        User user = saveUser(0L);

        mockMvc.perform(patch("/api/v1/users/me/nickname")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nickname": "가"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.error.message")
                        .value("닉네임은 2자 이상 30자 이하여야 합니다."));
    }

    @Test
    void nicknameLongerThanThirtyCharactersReturnsValidationError() throws Exception {
        User user = saveUser(0L);
        String nickname = "가".repeat(31);

        mockMvc.perform(patch("/api/v1/users/me/nickname")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nickname": "%s"
                                }
                                """.formatted(nickname)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.error.message")
                        .value("닉네임은 2자 이상 30자 이하여야 합니다."));
    }

    @Test
    void unknownAccountIdReturnsUserNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken(999_999L)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("USER_NOT_FOUND"))
                .andExpect(jsonPath("$.error.message").value("사용자를 찾을 수 없습니다."));
    }

    @Test
    void unauthenticatedRequestReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void partnerRoleCannotAccessUserEndpoint() throws Exception {
        String partnerToken = BEARER_PREFIX
                + jwtTokenProvider.createAccessToken(1L, Role.PARTNER);

        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, partnerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    @Test
    void userIssuesQrTokenContainingOwnAccountId() throws Exception {
        User user = saveUser(0L);

        String responseBody = mockMvc.perform(post("/api/v1/users/me/qr")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.qrToken").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String qrToken = JsonPath.read(responseBody, "$.data.qrToken");
        assertThat(jwtTokenProvider.getQrAccountId(qrToken)).isEqualTo(user.getId());
    }

    @Test
    void unauthenticatedUserCannotIssueQrToken() throws Exception {
        mockMvc.perform(post("/api/v1/users/me/qr"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void partnerCannotIssueUserQrToken() throws Exception {
        String partnerToken = BEARER_PREFIX
                + jwtTokenProvider.createAccessToken(1L, Role.PARTNER);

        mockMvc.perform(post("/api/v1/users/me/qr")
                        .header(HttpHeaders.AUTHORIZATION, partnerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    @Test
    void authenticatedUserChangesPassword() throws Exception {
        User user = saveUser(0L);

        mockMvc.perform(patch("/api/v1/users/me/password")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changePasswordBody(
                                CURRENT_PASSWORD,
                                NEW_PASSWORD,
                                NEW_PASSWORD
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").doesNotExist());

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(passwordEncoder.matches(NEW_PASSWORD, updatedUser.getPasswordHash())).isTrue();
        assertThat(passwordEncoder.matches(CURRENT_PASSWORD, updatedUser.getPasswordHash()))
                .isFalse();
    }

    @Test
    void incorrectCurrentPasswordReturnsBusinessError() throws Exception {
        User user = saveUser(0L);

        expectPasswordBusinessError(
                user,
                "wrongPassword123!",
                NEW_PASSWORD,
                NEW_PASSWORD,
                "CURRENT_PASSWORD_MISMATCH"
        );

        assertPasswordUnchanged(user.getId());
    }

    @Test
    void mismatchedPasswordConfirmationReturnsBusinessError() throws Exception {
        User user = saveUser(0L);

        expectPasswordBusinessError(
                user,
                CURRENT_PASSWORD,
                NEW_PASSWORD,
                "differentPassword123!",
                "PASSWORD_CONFIRM_MISMATCH"
        );

        assertPasswordUnchanged(user.getId());
    }

    @Test
    void sameAsOldPasswordReturnsBusinessError() throws Exception {
        User user = saveUser(0L);

        expectPasswordBusinessError(
                user,
                CURRENT_PASSWORD,
                CURRENT_PASSWORD,
                CURRENT_PASSWORD,
                "SAME_AS_OLD_PASSWORD"
        );

        assertPasswordUnchanged(user.getId());
    }

    @Test
    void passwordShorterThanEightCharactersReturnsValidationError() throws Exception {
        User user = saveUser(0L);

        expectPasswordValidationError(user, "short7!", "short7!");
        assertPasswordUnchanged(user.getId());
    }

    @Test
    void passwordLongerThanSeventyTwoCharactersReturnsValidationError() throws Exception {
        User user = saveUser(0L);
        String longPassword = "a".repeat(73);

        expectPasswordValidationError(user, longPassword, longPassword);
        assertPasswordUnchanged(user.getId());
    }

    @Test
    void passwordLongerThanSeventyTwoUtf8BytesReturnsValidationError() throws Exception {
        User user = saveUser(0L);
        String multibytePassword = "가".repeat(25);

        expectPasswordValidationError(user, multibytePassword, multibytePassword);
        assertPasswordUnchanged(user.getId());
    }

    @Test
    void unauthenticatedUserCannotChangePassword() throws Exception {
        mockMvc.perform(patch("/api/v1/users/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changePasswordBody(
                                CURRENT_PASSWORD,
                                NEW_PASSWORD,
                                NEW_PASSWORD
                        )))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void partnerCannotChangeUserPassword() throws Exception {
        String partnerToken = BEARER_PREFIX
                + jwtTokenProvider.createAccessToken(1L, Role.PARTNER);

        mockMvc.perform(patch("/api/v1/users/me/password")
                        .header(HttpHeaders.AUTHORIZATION, partnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changePasswordBody(
                                CURRENT_PASSWORD,
                                NEW_PASSWORD,
                                NEW_PASSWORD
                        )))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    private User saveUser(long totalCarbonG) {
        User user = User.create(
                "growup",
                passwordEncoder.encode(CURRENT_PASSWORD),
                "새싹이",
                "ABCDEFGH",
                CharacterType.TREE_A
        );
        ReflectionTestUtils.setField(user, "totalCarbonG", totalCarbonG);
        ReflectionTestUtils.setField(user, "convertibleCarbonG", 300L);
        ReflectionTestUtils.setField(user, "availablePoints", 200L);
        ReflectionTestUtils.setField(user, "totalEarnedPoints", 500L);
        ReflectionTestUtils.setField(user, "currentStreak", 4);
        ReflectionTestUtils.setField(user, "longestStreak", 9);
        return userRepository.saveAndFlush(user);
    }

    private void expectPasswordBusinessError(
            User user,
            String currentPassword,
            String newPassword,
            String newPasswordConfirm,
            String errorCode
    ) throws Exception {
        mockMvc.perform(patch("/api/v1/users/me/password")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changePasswordBody(
                                currentPassword,
                                newPassword,
                                newPasswordConfirm
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value(errorCode));
    }

    private void expectPasswordValidationError(
            User user,
            String newPassword,
            String newPasswordConfirm
    ) throws Exception {
        mockMvc.perform(patch("/api/v1/users/me/password")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changePasswordBody(
                                CURRENT_PASSWORD,
                                newPassword,
                                newPasswordConfirm
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    private String changePasswordBody(
            String currentPassword,
            String newPassword,
            String newPasswordConfirm
    ) {
        return """
                {
                  "currentPassword": "%s",
                  "newPassword": "%s",
                  "newPasswordConfirm": "%s"
                }
                """.formatted(currentPassword, newPassword, newPasswordConfirm);
    }

    private void assertPasswordUnchanged(Long userId) {
        User unchangedUser = userRepository.findById(userId).orElseThrow();
        assertThat(passwordEncoder.matches(CURRENT_PASSWORD, unchangedUser.getPasswordHash()))
                .isTrue();
    }

    private String bearerToken(Long accountId) {
        return BEARER_PREFIX + jwtTokenProvider.createAccessToken(accountId, Role.USER);
    }
}
