package com.growup.backend.verification.controller;

import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.global.security.AuthPrincipal;
import com.growup.backend.verification.dto.VerificationRequest;
import com.growup.backend.verification.dto.VerificationResponse;
import com.growup.backend.verification.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/verifications")
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping
    public ApiResponse<VerificationResponse> verify(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody VerificationRequest request
    ) {
        return ApiResponse.success(
                verificationService.verify(principal.accountId(), request)
        );
    }
}
