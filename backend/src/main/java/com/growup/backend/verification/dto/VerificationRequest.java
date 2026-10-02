package com.growup.backend.verification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record VerificationRequest(
        @NotBlank(message = "QR 토큰은 필수입니다.")
        String qrToken,

        @NotNull(message = "미션 ID는 필수입니다.")
        @Positive(message = "미션 ID는 양수여야 합니다.")
        Long missionId
) {
}
