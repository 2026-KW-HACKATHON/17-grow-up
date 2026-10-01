package com.growup.backend.mission.dto;

import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.domain.MissionCategory;

public record MissionDetailResponse(
        Long missionId,
        String name,
        String description,
        MissionCategory category,
        long carbonReductionG,
        boolean completedToday
) {

    public static MissionDetailResponse from(Mission mission, boolean completedToday) {
        return new MissionDetailResponse(
                mission.getId(),
                mission.getName(),
                mission.getDescription(),
                mission.getCategory(),
                mission.getCarbonReductionG(),
                completedToday
        );
    }
}
