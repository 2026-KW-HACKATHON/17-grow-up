package com.growup.backend.point.dto;

import com.growup.backend.mission.domain.MissionCompletion;
import java.time.LocalDateTime;

public record PointEarningHistoryResponse(
        Long missionId,
        String missionName,
        String partnerName,
        long earnedPoints,
        LocalDateTime earnedAt
) {
    public static PointEarningHistoryResponse from(MissionCompletion completion) {
        return new PointEarningHistoryResponse(
                completion.getMission().getId(),
                completion.getMission().getName(),
                completion.getPartner() == null ? null : completion.getPartner().getName(),
                completion.getMission().getRewardPoints(),
                completion.getCompletedAt()
        );
    }
}
