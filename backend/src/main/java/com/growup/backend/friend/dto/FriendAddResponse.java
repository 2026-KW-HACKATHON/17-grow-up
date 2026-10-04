package com.growup.backend.friend.dto;

import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;

public record FriendAddResponse(
        Long friendId,
        String nickname,
        CharacterType characterType
) {

    public static FriendAddResponse from(User friend) {
        return new FriendAddResponse(
                friend.getId(),
                friend.getNickname(),
                friend.getCharacterType()
        );
    }
}