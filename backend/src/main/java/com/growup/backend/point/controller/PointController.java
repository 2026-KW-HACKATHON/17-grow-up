package com.growup.backend.point.controller;

import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.global.security.AuthPrincipal;
import com.growup.backend.point.dto.PointConversionListResponse;
import com.growup.backend.point.dto.PointConversionRequest;
import com.growup.backend.point.dto.PointConversionResponse;
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
@RequestMapping("/api/v1/points/conversions")
public class PointController {

    private final PointService pointService;

    @PostMapping
    public ApiResponse<PointConversionResponse> convert(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody PointConversionRequest request
    ) {
        return ApiResponse.success(pointService.convert(principal.accountId(), request));
    }

    @GetMapping
    public ApiResponse<PointConversionListResponse> getConversions(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(pointService.getConversions(principal.accountId()));
    }
}
