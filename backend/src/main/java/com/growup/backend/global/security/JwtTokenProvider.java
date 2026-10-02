package com.growup.backend.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private static final String ACCOUNT_ID_CLAIM = "accountId";
    private static final String ROLE_CLAIM = "role";
    private static final String TOKEN_TYPE_CLAIM = "tokenType";

    private final SecretKey secretKey;
    private final long accessTokenExpirationSeconds;
    private final long qrTokenExpirationSeconds;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String encodedSecret,
            @Value("${jwt.access-token-expiration-seconds}") long accessTokenExpirationSeconds,
            @Value("${jwt.qr-token-expiration-seconds}") long qrTokenExpirationSeconds
    ) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(encodedSecret));
        this.accessTokenExpirationSeconds = accessTokenExpirationSeconds;
        this.qrTokenExpirationSeconds = qrTokenExpirationSeconds;
    }

    public String createAccessToken(Long accountId, Role role) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusSeconds(accessTokenExpirationSeconds);

        return Jwts.builder()
                .claim(ACCOUNT_ID_CLAIM, accountId)
                .claim(ROLE_CLAIM, role.name())
                .claim(TOKEN_TYPE_CLAIM, JwtTokenType.ACCESS.name())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    public String createQrToken(Long accountId) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusSeconds(qrTokenExpirationSeconds);

        return Jwts.builder()
                .claim(ACCOUNT_ID_CLAIM, accountId)
                .claim(TOKEN_TYPE_CLAIM, JwtTokenType.QR.name())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);
        validateTokenType(claims, JwtTokenType.ACCESS);
        Long accountId = getAccountId(claims);
        Role role = Role.valueOf(claims.get(ROLE_CLAIM, String.class));
        AuthPrincipal principal = new AuthPrincipal(accountId, role);

        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );
    }

    public Long getQrAccountId(String token) {
        Claims claims = parseClaims(token);
        validateTokenType(claims, JwtTokenType.QR);
        return getAccountId(claims);
    }

    public long getAccessTokenExpirationSeconds() {
        return accessTokenExpirationSeconds;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private void validateTokenType(Claims claims, JwtTokenType expectedType) {
        String tokenType = claims.get(TOKEN_TYPE_CLAIM, String.class);
        if (!expectedType.name().equals(tokenType)) {
            throw new IllegalArgumentException("JWT 용도가 올바르지 않습니다.");
        }
    }

    private Long getAccountId(Claims claims) {
        Object accountId = claims.get(ACCOUNT_ID_CLAIM);
        if (accountId instanceof Number number) {
            return number.longValue();
        }
        return Long.valueOf(String.valueOf(accountId));
    }
}
