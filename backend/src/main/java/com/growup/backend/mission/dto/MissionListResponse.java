package com.growup.backend.mission.dto;

import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.domain.MissionCategory;

public record MissionListResponse(
        Long missionId,
        String name,
        MissionCategory category,
        long carbonReductionG,
        long rewardPoints,
        boolean completedToday
) {

    public static MissionListResponse from(Mission mission, boolean completedToday) {
        return new MissionListResponse(
                mission.getId(),
                mission.getName(),
                mission.getCategory(),
                mission.getCarbonReductionG(),
                mission.getRewardPoints(),
                completedToday
        );
    }
}
