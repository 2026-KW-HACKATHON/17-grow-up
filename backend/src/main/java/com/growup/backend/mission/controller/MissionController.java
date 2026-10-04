package com.growup.backend.mission.controller;

import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.global.security.AuthPrincipal;
import com.growup.backend.mission.dto.MissionDetailResponse;
import com.growup.backend.mission.dto.MissionListResponse;
import com.growup.backend.mission.service.MissionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/missions")
public class MissionController {

    private final MissionService missionService;

    @GetMapping
    public ApiResponse<List<MissionListResponse>> getMissions(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(missionService.getActiveMissions(principal.accountId()));
    }

    @GetMapping("/{missionId}")
    public ApiResponse<MissionDetailResponse> getMission(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable Long missionId
    ) {
        return ApiResponse.success(
                missionService.getActiveMission(principal.accountId(), missionId)
        );
    }
}
