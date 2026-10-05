package com.growup.backend.point.dto;

import java.util.List;

public record PointConversionListResponse(
        List<PointConversionHistoryResponse> conversions
) {
}
