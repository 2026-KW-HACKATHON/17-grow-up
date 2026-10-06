package com.growup.backend.partner.controller;

import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.global.security.AuthPrincipal;
import com.growup.backend.partner.dto.PartnerListResponse;
import com.growup.backend.partner.dto.PartnerMeResponse;
import com.growup.backend.partner.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/partners")
public class PartnerController {

    private final PartnerService partnerService;

    @GetMapping
    public ApiResponse<PartnerListResponse> getPartners() {
        return ApiResponse.success(partnerService.getPartners());
    }

    @GetMapping("/me")
    public ApiResponse<PartnerMeResponse> getMyPartner(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(
                partnerService.getMyPartner(principal.accountId())
        );
    }
}