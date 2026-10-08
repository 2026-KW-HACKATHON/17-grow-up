package com.growup.backend.user.dto;

import com.growup.backend.user.domain.CharacterGrowthPolicy;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;

public record UserMeResponse(
        Long userId,
        String loginId,
        String nickname,
        CharacterType characterType,
        int characterLevel,
        long totalCarbonG,
        long convertibleCarbonG,
        long availablePoints,
        long totalEarnedPoints,
        int currentStreak,
        int longestStreak
) {

    public static UserMeResponse from(User user) {
        return new UserMeResponse(
                user.getId(),
                user.getLoginId(),
                user.getNickname(),
                user.getCharacterType(),
                CharacterGrowthPolicy.calculate(user.getTotalCarbonG()).level(),
                user.getTotalCarbonG(),
                user.getConvertibleCarbonG(),
                user.getAvailablePoints(),
                user.getTotalEarnedPoints(),
                user.getCurrentStreak(),
                user.getLongestStreak()
        );
    }

}
