package com.growup.backend.record.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.record.dto.RecordHistoryItemResponse;
import com.growup.backend.record.dto.RecordHistoryResponse;
import com.growup.backend.record.dto.RecordSummaryResponse;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecordService {

    private final UserRepository userRepository;
    private final MissionCompletionRepository missionCompletionRepository;

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
}