package com.growup.backend.record.controller;

import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.global.security.AuthPrincipal;
import com.growup.backend.record.dto.FriendRecordListResponse;
import com.growup.backend.record.dto.RecordCalendarResponse;
import com.growup.backend.record.dto.RecordHistoryResponse;
import com.growup.backend.record.dto.RecordSummaryResponse;
import com.growup.backend.record.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/records")
public class RecordController {

    private final RecordService recordService;

    @GetMapping("/summary")
    public ApiResponse<RecordSummaryResponse> getSummary(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(
                recordService.getSummary(principal.accountId())
        );
    }

    @GetMapping("/history")
    public ApiResponse<RecordHistoryResponse> getHistory(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(
                recordService.getHistory(principal.accountId())
        );
    }

    @GetMapping("/calendar")
    public ApiResponse<RecordCalendarResponse> getCalendar(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ApiResponse.success(
                recordService.getCalendar(
                        principal.accountId(),
                        year,
                        month
                )
        );
    }

    @GetMapping("/friends")
    public ApiResponse<FriendRecordListResponse> getFriendRecords(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(
                recordService.getFriendRecords(principal.accountId())
        );
    }
}