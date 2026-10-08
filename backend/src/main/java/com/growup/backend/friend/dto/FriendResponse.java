
package com.growup.backend.friend.dto;

import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record FriendResponse(
        Long friendId,
        String nickname,
        CharacterType characterType,
        int currentStreak,
        LocalDateTime lastActiveAt
) {

    public static FriendResponse from(User friend) {
        LocalDate today = LocalDate.now();
        LocalDate lastPracticeDate = friend.getLastPracticeDate();

        int currentStreak = 0;

        if (lastPracticeDate != null &&
                !lastPracticeDate.isBefore(today.minusDays(1))) {
            currentStreak = friend.getCurrentStreak();
        }

        return new FriendResponse(
                friend.getId(),
                friend.getNickname(),
                friend.getCharacterType(),
                currentStreak,
                friend.getLastActiveAt()
        );
    }
}
