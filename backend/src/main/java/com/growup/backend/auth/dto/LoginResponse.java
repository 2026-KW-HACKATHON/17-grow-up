package com.growup.backend.auth.dto;

import com.growup.backend.user.domain.User;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserInfo user
) {
    public static LoginResponse bearer(String accessToken, long expiresIn, User user) {
        return new LoginResponse(
                accessToken,
                "Bearer",
                expiresIn,
                UserInfo.from(user)
        );
    }

    public record UserInfo(
            Long id,
            String nickname
    ) {
        private static UserInfo from(User user) {
            return new UserInfo(user.getId(), user.getNickname());
        }
    }
}
