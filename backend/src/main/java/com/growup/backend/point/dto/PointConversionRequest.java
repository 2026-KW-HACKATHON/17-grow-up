package com.growup.backend.point.dto;

import com.growup.backend.global.validation.MultipleOf;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PointConversionRequest(
        @NotNull(message = "전환할 포인트는 필수입니다.")
        @Min(value = 10_000, message = "전환할 포인트는 10,000P 이상이어야 합니다.")
        @MultipleOf(value = 10_000, message = "포인트는 10,000P 단위여야 합니다.")
        Long points
) {
}
