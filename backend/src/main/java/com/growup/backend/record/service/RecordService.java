package com.growup.backend.record.service;

import com.growup.backend.friend.repository.FriendshipRepository;
import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.mission.domain.MissionCompletion;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.record.dto.FriendRecordListResponse;
import com.growup.backend.record.dto.FriendRecordResponse;
import com.growup.backend.record.dto.RecordCalendarDayResponse;
import com.growup.backend.record.dto.RecordCalendarResponse;
import com.growup.backend.record.dto.RecordHistoryItemResponse;
import com.growup.backend.record.dto.RecordHistoryResponse;
import com.growup.backend.record.dto.RecordSummaryResponse;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecordService {

    private final UserRepository userRepository;
    private final MissionCompletionRepository missionCompletionRepository;
    private final FriendshipRepository friendshipRepository;

    public RecordSummaryResponse getSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        long totalMissionCount = missionCompletionRepository.countByUserId(userId);

        return new RecordSummaryResponse(
                user.getTotalCarbonG(),
                totalMissionCount,
                user.getCurrentStreak()
        );
    }

    public RecordHistoryResponse getHistory(Long userId) {
        List<RecordHistoryItemResponse> records =
                missionCompletionRepository.findAllByUserIdOrderByCompletedAtDesc(userId)
                        .stream()
                        .map(RecordHistoryItemResponse::from)
                        .toList();

        return new RecordHistoryResponse(records);
    }

    public RecordCalendarResponse getCalendar(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<MissionCompletion> completions =
                missionCompletionRepository
                        .findAllByUserIdAndCompletedDateBetweenOrderByCompletedDateAsc(
                                userId,
                                startDate,
                                endDate
                        );

        Map<LocalDate, Long> missionCountByDate = new LinkedHashMap<>();

        for (MissionCompletion completion : completions) {
            LocalDate date = completion.getCompletedDate();

            missionCountByDate.put(
                    date,
                    missionCountByDate.getOrDefault(date, 0L) + 1
            );
        }

        List<RecordCalendarDayResponse> practiceDays = missionCountByDate.entrySet()
                .stream()
                .map(entry -> new RecordCalendarDayResponse(
                        entry.getKey(),
                        entry.getValue()
                ))
                .toList();

        return new RecordCalendarResponse(
                year,
                month,
                practiceDays
        );
    }

    public FriendRecordListResponse getFriendRecords(Long userId) {
        List<FriendRecordResponse> friends = friendshipRepository.findAllByUserId(userId)
                .stream()
                .map(friendship -> {
                    User friend = friendship.getFriend();

                    long totalMissionCount =
                            missionCompletionRepository.countByUserId(friend.getId());

                    return new FriendRecordResponse(
                            friend.getId(),
                            friend.getNickname(),
                            friend.getTotalCarbonG(),
                            totalMissionCount,
                            friend.getCurrentStreak()
                    );
                })
                .toList();

        return new FriendRecordListResponse(friends);
    }
}