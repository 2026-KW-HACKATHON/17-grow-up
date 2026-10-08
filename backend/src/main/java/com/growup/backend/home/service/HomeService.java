
package com.growup.backend.home.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.home.dto.HomeResponse;
import com.growup.backend.mission.domain.MissionCompletion;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.mission.service.MissionService;
import com.growup.backend.user.domain.CharacterGrowthPolicy;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeService {

    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");
    private static final int RECENT_ACTIVITY_LIMIT = 5;

    private final UserRepository userRepository;
    private final MissionService missionService;
    private final MissionCompletionRepository missionCompletionRepository;

    public HomeResponse getHome(Long accountId) {
        User user = userRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        LocalDate today = LocalDate.now(KST_ZONE_ID);

        return new HomeResponse(
                getCharacterGrowth(user),
                user.getAvailablePoints(),
                user.getTotalCarbonG(),
                getStreak(user, today),
                getTodayMissions(accountId),
                getRecentActivities(accountId)
        );
    }

    private HomeResponse.CharacterGrowth getCharacterGrowth(User user) {
        CharacterGrowthPolicy.Growth growth =
                CharacterGrowthPolicy.calculate(user.getTotalCarbonG());

        return new HomeResponse.CharacterGrowth(
                user.getCharacterType(),
                growth.level(),
                growth.progressPercent(),
                growth.remainingCarbonG()
        );
    }

    private HomeResponse.Streak getStreak(User user, LocalDate today) {
        LocalDate startOfWeek = today.with(
                TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)
        );
        LocalDate endOfWeek = startOfWeek.plusDays(6);

        Set<LocalDate> completedDates = new HashSet<>();

        missionCompletionRepository
                .findAllByUserIdAndCompletedDateBetweenOrderByCompletedDateAsc(
                        user.getId(),
                        startOfWeek,
                        endOfWeek
                )
                .forEach(completion ->
                        completedDates.add(completion.getCompletedDate())
                );

        List<HomeResponse.WeeklyPractice> weeklyPractices =
                startOfWeek.datesUntil(endOfWeek.plusDays(1))
                        .map(date -> new HomeResponse.WeeklyPractice(
                                date,
                                completedDates.contains(date)
                        ))
                        .toList();

        return new HomeResponse.Streak(
                user.getCurrentStreak(),
                weeklyPractices
        );
    }

    private List<HomeResponse.TodayMission> getTodayMissions(Long accountId) {
        return missionService.getActiveMissions(accountId)
                .stream()
                .map(mission -> new HomeResponse.TodayMission(
                        mission.missionId(),
                        mission.name(),
                        mission.category().name(),
                        mission.carbonReductionG(),
                        mission.rewardPoints(),
                        mission.completedToday()
                ))
                .toList();
    }

    private List<HomeResponse.RecentActivity> getRecentActivities(Long accountId) {
        return missionCompletionRepository.findPointHistoryByUserId(accountId)
                .stream()
                .limit(RECENT_ACTIVITY_LIMIT)
                .map(this::toRecentActivity)
                .toList();
    }

    private HomeResponse.RecentActivity toRecentActivity(
            MissionCompletion completion
    ) {
        String partnerName = completion.getPartner() == null
                ? null
                : completion.getPartner().getName();

        return new HomeResponse.RecentActivity(
                completion.getMission().getId(),
                completion.getMission().getName(),
                partnerName,
                completion.getMission().getRewardPoints(),
                completion.getCompletedAt()
        );
    }
}
