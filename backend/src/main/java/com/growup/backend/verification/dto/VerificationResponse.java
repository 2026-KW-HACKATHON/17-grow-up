package com.growup.backend.verification.dto;

import com.growup.backend.mission.domain.MissionCompletion;
import java.time.LocalDate;

public record VerificationResponse(
        Long missionCompletionId,
        Long userId,
        Long missionId,
        LocalDate completedDate
) {

    public static VerificationResponse from(MissionCompletion completion) {
        return new VerificationResponse(
                completion.getId(),
                completion.getUser().getId(),
                completion.getMission().getId(),
                completion.getCompletedDate()
        );
    }
}
