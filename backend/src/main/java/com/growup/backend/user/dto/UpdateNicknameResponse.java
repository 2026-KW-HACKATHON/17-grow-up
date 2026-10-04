package com.growup.backend.user.dto;

import com.growup.backend.user.domain.User;

public record UpdateNicknameResponse(
        Long userId,
        String nickname
) {

    public static UpdateNicknameResponse from(User user) {
        return new UpdateNicknameResponse(user.getId(), user.getNickname());
    }
}
