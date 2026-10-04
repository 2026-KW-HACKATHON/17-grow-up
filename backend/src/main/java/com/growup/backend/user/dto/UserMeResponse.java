package com.growup.backend.user.dto;

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

    private static final long LEVEL_2_MIN_CARBON_G = 1_610L;
    private static final long LEVEL_3_MIN_CARBON_G = 6_900L;
    private static final long LEVEL_4_MIN_CARBON_G = 20_700L;

    public static UserMeResponse from(User user) {
        return new UserMeResponse(
                user.getId(),
                user.getLoginId(),
                user.getNickname(),
                user.getCharacterType(),
                calculateCharacterLevel(user.getTotalCarbonG()),
                user.getTotalCarbonG(),
                user.getConvertibleCarbonG(),
                user.getAvailablePoints(),
                user.getTotalEarnedPoints(),
                user.getCurrentStreak(),
                user.getLongestStreak()
        );
    }

    private static int calculateCharacterLevel(long totalCarbonG) {
        if (totalCarbonG >= LEVEL_4_MIN_CARBON_G) {
            return 4;
        }
        if (totalCarbonG >= LEVEL_3_MIN_CARBON_G) {
            return 3;
        }
        if (totalCarbonG >= LEVEL_2_MIN_CARBON_G) {
            return 2;
        }
        return 1;
    }
}
