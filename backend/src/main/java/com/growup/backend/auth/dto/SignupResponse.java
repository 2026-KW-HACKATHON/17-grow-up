package com.growup.backend.auth.dto;

import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;

public record SignupResponse(
        Long userId,
        String loginId,
        String nickname,
        CharacterType characterType
) {
    public static SignupResponse from(User user) {
        return new SignupResponse(
                user.getId(),
                user.getLoginId(),
                user.getNickname(),
                user.getCharacterType()
        );
    }
}
