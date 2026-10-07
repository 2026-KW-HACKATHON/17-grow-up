package com.growup.backend.record.dto;

public record RecordSummaryResponse(
        long totalCarbonG,
        long totalMissionCount,
        int currentStreak,
        int longestStreak
) {
}