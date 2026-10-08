
package com.growup.backend.friend.dto;

import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import java.time.LocalDateTime;

public record FriendResponse(
        Long friendId,
        String nickname,
        CharacterType characterType,
        int currentStreak,
        LocalDateTime lastActiveAt
) {

    public static FriendResponse from(User friend) {
        return new FriendResponse(
                friend.getId(),
                friend.getNickname(),
                friend.getCharacterType(),
                friend.getCurrentStreak(),
                friend.getLastActiveAt()
        );
    }
}
