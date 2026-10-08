package com.growup.backend.point.dto;

import java.util.List;

public record PointHistoryResponse(
        long availablePoints,
        long monthlyEarnedPoints,
        List<PointEarningHistoryResponse> histories
) {
}
