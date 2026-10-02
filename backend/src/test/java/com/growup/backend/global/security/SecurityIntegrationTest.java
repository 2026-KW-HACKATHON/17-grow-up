package com.growup.backend.global.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    private static final String TEST_SECRET =
            "dGVzdC1qd3Qtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTMyLWJ5dGVzLWxvbmc=";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JwtAccessDeniedHandler accessDeniedHandler;

    @Test
    void protectedEndpointWithoutTokenReturnsCommonUnauthorizedResponse() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.error.message").value("인증이 필요합니다."));
    }

    @Test
    void malformedTokenReturnsCommonUnauthorizedResponse() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer malformed-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void qrTokenCannotBeUsedAsAuthorizationToken() throws Exception {
        String qrToken = jwtTokenProvider.createQrToken(1L);

        expectUnauthorized(qrToken);
    }

    @Test
    void tamperedAccessTokenReturnsUnauthorized() throws Exception {
        String accessToken = jwtTokenProvider.createAccessToken(1L, Role.USER);
        String tamperedToken = accessToken.substring(0, accessToken.length() - 1)
                + (accessToken.endsWith("a") ? "b" : "a");

        expectUnauthorized(tamperedToken);
    }

    @Test
    void expiredAccessTokenReturnsUnauthorized() throws Exception {
        JwtTokenProvider expiredTokenProvider = new JwtTokenProvider(
                TEST_SECRET,
                -1L,
                300L
        );

        expectUnauthorized(expiredTokenProvider.createAccessToken(1L, Role.USER));
    }

    @Test
    void accessDeniedHandlerReturnsCommonForbiddenResponse() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        accessDeniedHandler.handle(
                new MockHttpServletRequest(),
                response,
                new AccessDeniedException("forbidden")
        );

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains(
                "\"success\":false",
                "\"code\":\"FORBIDDEN\"",
                "접근 권한이 없습니다."
        );
    }

    private void expectUnauthorized(String token) throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }
}
