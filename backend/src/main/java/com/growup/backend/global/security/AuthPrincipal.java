package com.growup.backend.global.security;

public record AuthPrincipal(Long accountId, Role role) {
}
