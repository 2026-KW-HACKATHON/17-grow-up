package com.growup.backend.record.dto;

public record FriendRecordResponse(
        Long friendId,
        String nickname,
        long totalCarbonG,
        long totalMissionCount,
        int currentStreak
) {
}