package com.growup.backend.global.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Set;
import java.time.Instant;
import java.util.Date;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

class JwtTokenProviderTest {

    private static final String SECRET =
            "dGVzdC1qd3Qtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTMyLWJ5dGVzLWxvbmc=";

    @Test
    void accessTokenContainsOnlyStableAuthenticationClaimsAndStandardTimes() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 3600L, 300L);

        String token = provider.createAccessToken(15L, Role.USER);

        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET)))
                .build()
                .parseSignedClaims(token)
                .getPayload();

        assertThat(claims.keySet()).isEqualTo(
                Set.of("accountId", "role", "tokenType", "iat", "exp")
        );
        assertThat(((Number) claims.get("accountId")).longValue()).isEqualTo(15L);
        assertThat(claims.get("role", String.class)).isEqualTo("USER");
        assertThat(claims.get("tokenType", String.class)).isEqualTo("ACCESS");
        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void tokenBuildsAuthenticatedPrincipalAndRoleAuthority() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 3600L, 300L);
        String token = provider.createAccessToken(21L, Role.PARTNER);

        Authentication authentication = provider.getAuthentication(token);

        assertThat(authentication.isAuthenticated()).isTrue();
        assertThat(authentication.getPrincipal())
                .isEqualTo(new AuthPrincipal(21L, Role.PARTNER));
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_PARTNER");
    }

    @Test
    void qrTokenContainsAccountIdAndCannotBeUsedAsAccessToken() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 3600L, 300L);
        String qrToken = provider.createQrToken(31L);

        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET)))
                .build()
                .parseSignedClaims(qrToken)
                .getPayload();

        assertThat(provider.getQrAccountId(qrToken)).isEqualTo(31L);
        assertThat(claims.keySet()).isEqualTo(Set.of("accountId", "tokenType", "iat", "exp"));
        assertThat(claims.get("tokenType", String.class)).isEqualTo("QR");
        assertThat(claims.getExpiration().getTime() - claims.getIssuedAt().getTime())
                .isEqualTo(300_000L);
        assertThatThrownBy(() -> provider.getAuthentication(qrToken))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void accessTokenCannotBeUsedAsQrToken() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 3600L, 300L);
        String accessToken = provider.createAccessToken(41L, Role.USER);

        assertThatThrownBy(() -> provider.getQrAccountId(accessToken))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void tokenWithoutTokenTypeCannotBeUsedAsAccessToken() {
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, 3600L, 300L);
        Instant issuedAt = Instant.now();
        String legacyToken = Jwts.builder()
                .claim("accountId", 51L)
                .claim("role", Role.USER.name())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(issuedAt.plusSeconds(3_600L)))
                .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET)))
                .compact();

        assertThatThrownBy(() -> provider.getAuthentication(legacyToken))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
