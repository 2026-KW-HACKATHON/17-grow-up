package com.growup.backend.record.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.record.dto.RecordSummaryResponse;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
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
}