package com.growup.backend.partner.controller;

import com.growup.backend.auth.dto.AccessTokenResponse;
import com.growup.backend.auth.dto.LoginRequest;
import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.partner.service.PartnerAuthService;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/partner-auth")
@SecurityRequirements
public class PartnerAuthController {

    private final PartnerAuthService partnerAuthService;

    @PostMapping("/login")
    public ApiResponse<AccessTokenResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ApiResponse.success(partnerAuthService.login(request));
    }
}
