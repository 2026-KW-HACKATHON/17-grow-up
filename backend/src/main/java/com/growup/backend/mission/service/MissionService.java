package com.growup.backend.mission.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.dto.MissionDetailResponse;
import com.growup.backend.mission.dto.MissionListResponse;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.mission.repository.MissionRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MissionService {

    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");

    private final MissionRepository missionRepository;
    private final MissionCompletionRepository missionCompletionRepository;

    public List<MissionListResponse> getActiveMissions(Long accountId) {
        LocalDate today = LocalDate.now(KST_ZONE_ID);
        Set<Long> completedMissionIds = new HashSet<>(
                missionCompletionRepository
                        .findCompletedMissionIdsByUserIdAndCompletedDate(accountId, today)
        );

        return missionRepository.findAllByActiveTrueOrderByIdAsc().stream()
                .map(mission -> MissionListResponse.from(
                        mission,
                        completedMissionIds.contains(mission.getId())
                ))
                .toList();
    }

    public MissionDetailResponse getActiveMission(Long accountId, Long missionId) {
        Mission mission = missionRepository.findByIdAndActiveTrue(missionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MISSION_NOT_FOUND));

        return MissionDetailResponse.from(
                mission,
                missionCompletionRepository.existsByUserIdAndMissionIdAndCompletedDate(
                        accountId,
                        mission.getId(),
                        LocalDate.now(KST_ZONE_ID)
                )
        );
    }
}
