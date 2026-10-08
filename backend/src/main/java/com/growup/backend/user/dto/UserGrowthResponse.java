package com.growup.backend.user.dto;

import com.growup.backend.user.domain.CharacterGrowthPolicy;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import java.util.List;

public record UserGrowthResponse(
        CharacterType characterType,
        int characterLevel,
        long totalCarbonG,
        long currentLevelMinCarbonG,
        Long nextLevelCarbonG,
        long remainingCarbonG,
        double progressPercent,
        long totalMissionCount,
        List<MissionStatResponse> missionStats
) {
    public static UserGrowthResponse from(
            User user,
            CharacterGrowthPolicy.Growth growth,
            long totalMissionCount,
            List<MissionStatResponse> missionStats
    ) {
        return new UserGrowthResponse(
                user.getCharacterType(),
                growth.level(),
                user.getTotalCarbonG(),
                growth.currentLevelMinCarbonG(),
                growth.nextLevelCarbonG(),
                growth.remainingCarbonG(),
                growth.progressPercent(),
                totalMissionCount,
                missionStats
        );
    }
}
