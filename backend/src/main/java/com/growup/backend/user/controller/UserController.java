package com.growup.backend.user.controller;

import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.global.security.AuthPrincipal;
import com.growup.backend.user.dto.ChangePasswordRequest;
import com.growup.backend.user.dto.QrTokenResponse;
import com.growup.backend.user.dto.UpdateNicknameRequest;
import com.growup.backend.user.dto.UpdateNicknameResponse;
import com.growup.backend.user.dto.UserGrowthResponse;
import com.growup.backend.user.dto.UserMeResponse;
import com.growup.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    @PostMapping("/me/qr")
    public ApiResponse<QrTokenResponse> issueQrToken(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(userService.issueQrToken(principal.accountId()));
    }

    @GetMapping("/me")
    public ApiResponse<UserMeResponse> getMyInfo(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(userService.getMyInfo(principal.accountId()));
    }

    @GetMapping("/me/growth")
    public ApiResponse<UserGrowthResponse> getMyGrowth(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(userService.getMyGrowth(principal.accountId()));
    }

    @PatchMapping("/me/nickname")
    public ApiResponse<UpdateNicknameResponse> updateNickname(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody UpdateNicknameRequest request
    ) {
        return ApiResponse.success(userService.updateNickname(principal.accountId(), request));
    }

    @PatchMapping("/me/password")
    public ApiResponse<Void> changePassword(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(principal.accountId(), request);
        return ApiResponse.success(null);
    }
}
