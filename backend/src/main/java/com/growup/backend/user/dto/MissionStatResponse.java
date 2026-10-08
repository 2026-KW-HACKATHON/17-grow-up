package com.growup.backend.user.dto;

import com.growup.backend.mission.repository.MissionCompletionStatProjection;

public record MissionStatResponse(
        Long missionId,
        String missionName,
        long count,
        double percentage
) {
    public static MissionStatResponse from(
            MissionCompletionStatProjection stat,
            long totalMissionCount
    ) {
        double percentage = totalMissionCount == 0L
                ? 0.0
                : roundToTwoDecimalPlaces(
                        (double) stat.getCompletionCount() / totalMissionCount * 100.0
                );

        return new MissionStatResponse(
                stat.getMissionId(),
                stat.getMissionName(),
                stat.getCompletionCount(),
                percentage
        );
    }

    private static double roundToTwoDecimalPlaces(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
