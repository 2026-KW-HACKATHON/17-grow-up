package com.growup.backend.global.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

class JwtTokenProviderTest {

    private static final String SECRET =
            "dGVzdC1qd3Qtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTMyLWJ5dGVzLWxvbmc=";

    @Test
    void accessTokenContainsOnlyStableAuthenticationClaimsAndStandardTimes() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 3600L);

        String token = provider.createAccessToken(15L, Role.USER);

        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET)))
                .build()
                .parseSignedClaims(token)
                .getPayload();

        assertThat(claims.keySet()).isEqualTo(Set.of("accountId", "role", "iat", "exp"));
        assertThat(((Number) claims.get("accountId")).longValue()).isEqualTo(15L);
        assertThat(claims.get("role", String.class)).isEqualTo("USER");
        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void tokenBuildsAuthenticatedPrincipalAndRoleAuthority() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 3600L);
        String token = provider.createAccessToken(21L, Role.PARTNER);

        Authentication authentication = provider.getAuthentication(token);

        assertThat(authentication.isAuthenticated()).isTrue();
        assertThat(authentication.getPrincipal())
                .isEqualTo(new AuthPrincipal(21L, Role.PARTNER));
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_PARTNER");
    }
}
