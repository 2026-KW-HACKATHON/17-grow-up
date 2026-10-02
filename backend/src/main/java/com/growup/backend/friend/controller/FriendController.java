package com.growup.backend.friend.controller;

import com.growup.backend.friend.dto.FriendInviteResponse;
import com.growup.backend.friend.dto.FriendListResponse;
import com.growup.backend.friend.service.FriendService;
import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.global.security.AuthPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/friends")
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    public ApiResponse<FriendListResponse> getFriends(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(
                friendService.getFriends(principal.accountId())
        );
    }

    @GetMapping("/invite")
    public ApiResponse<FriendInviteResponse> getInviteLink(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(
                friendService.getInviteLink(principal.accountId())
        );
    }
}