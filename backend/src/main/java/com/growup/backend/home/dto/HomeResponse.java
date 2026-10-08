
package com.growup.backend.home.dto;

import com.growup.backend.user.domain.CharacterType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record HomeResponse(
        CharacterGrowth characterGrowth,
        long availablePoints,
        long totalCarbonG,
        Streak streak,
        List<TodayMission> todayMissions,
        List<RecentActivity> recentActivities
) {

    public record CharacterGrowth(
            CharacterType characterType,
            int level,
            double progressPercent,
            long remainingCarbonG
    ) {
    }

    public record Streak(
            int currentStreak,
            List<WeeklyPractice> weeklyPractices
    ) {
    }

    public record WeeklyPractice(
            LocalDate date,
            boolean completed
    ) {
    }

    public record TodayMission(
            Long missionId,
            String missionName,
            String category,
            long carbonReductionG,
            long rewardPoints,
            boolean completedToday
    ) {
    }

    public record RecentActivity(
            Long missionId,
            String missionName,
            String partnerName,
            long earnedPoints,
            LocalDateTime completedAt
    ) {
    }
}
