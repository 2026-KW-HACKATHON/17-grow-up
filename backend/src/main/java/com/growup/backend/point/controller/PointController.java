package com.growup.backend.point.controller;

import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.global.security.AuthPrincipal;
import com.growup.backend.point.dto.PointConversionListResponse;
import com.growup.backend.point.dto.PointConversionRequest;
import com.growup.backend.point.dto.PointConversionResponse;
import com.growup.backend.point.dto.PointHistoryResponse;
import com.growup.backend.point.service.PointService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/points")
public class PointController {

    private final PointService pointService;

    @PostMapping("/conversions")
    public ApiResponse<PointConversionResponse> convert(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody PointConversionRequest request
    ) {
        return ApiResponse.success(pointService.convert(principal.accountId(), request));
    }

    @GetMapping("/conversions")
    public ApiResponse<PointConversionListResponse> getConversions(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(pointService.getConversions(principal.accountId()));
    }

    @GetMapping("/history")
    public ApiResponse<PointHistoryResponse> getHistory(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(pointService.getHistory(principal.accountId()));
    }
}
