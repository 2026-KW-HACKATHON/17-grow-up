package com.growup.backend.record.dto;

import com.growup.backend.mission.domain.MissionCompletion;
import java.time.LocalDateTime;

public record RecordHistoryItemResponse(
        Long missionId,
        String missionName,
        long carbonReductionG,
        LocalDateTime completedAt
) {

    public static RecordHistoryItemResponse from(MissionCompletion completion) {
        return new RecordHistoryItemResponse(
                completion.getMission().getId(),
                completion.getMission().getName(),
                completion.getMission().getCarbonReductionG(),
                completion.getCompletedAt()
        );
    }
}