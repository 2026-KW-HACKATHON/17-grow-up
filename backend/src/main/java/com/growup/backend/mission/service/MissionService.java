package com.growup.backend.mission.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.dto.MissionDetailResponse;
import com.growup.backend.mission.dto.MissionListResponse;
import com.growup.backend.mission.repository.MissionRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MissionService {

    private final MissionRepository missionRepository;

    public List<MissionListResponse> getActiveMissions(Long accountId) {
        return missionRepository.findAllByActiveTrueOrderByIdAsc().stream()
                .map(mission -> MissionListResponse.from(
                        mission,
                        isCompletedToday(accountId, mission.getId())
                ))
                .toList();
    }

    public MissionDetailResponse getActiveMission(Long accountId, Long missionId) {
        Mission mission = missionRepository.findByIdAndActiveTrue(missionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MISSION_NOT_FOUND));

        return MissionDetailResponse.from(
                mission,
                isCompletedToday(accountId, mission.getId())
        );
    }

    private boolean isCompletedToday(Long accountId, Long missionId) {
        // TODO: MissionCompletion 도입 후 사용자와 미션을 기준으로 오늘의 완료 여부를 조회합니다.
        return false;
    }
}
