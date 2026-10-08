
package com.growup.backend.home.controller;

import com.growup.backend.global.response.ApiResponse;
import com.growup.backend.global.security.AuthPrincipal;
import com.growup.backend.home.dto.HomeResponse;
import com.growup.backend.home.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/home")
public class HomeController {

    private final HomeService homeService;

    @GetMapping
    public ApiResponse<HomeResponse> getHome(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return ApiResponse.success(
                homeService.getHome(principal.accountId())
        );
    }
}
