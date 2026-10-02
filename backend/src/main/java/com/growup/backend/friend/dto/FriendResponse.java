package com.growup.backend.friend.dto;

import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;

public record FriendResponse(
        Long friendId,
        String nickname,
        CharacterType characterType
) {

    public static FriendResponse from(User friend) {
        return new FriendResponse(
                friend.getId(),
                friend.getNickname(),
                friend.getCharacterType()
        );
    }
}