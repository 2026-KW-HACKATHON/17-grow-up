package com.growup.backend.point.dto;

import com.growup.backend.point.domain.PointConversion;
import java.time.LocalDateTime;

public record PointConversionHistoryResponse(
        Long conversionId,
        long convertedPoints,
        long seoulPayAmount,
        LocalDateTime createdAt
) {
    public static PointConversionHistoryResponse from(PointConversion conversion) {
        return new PointConversionHistoryResponse(
                conversion.getId(),
                conversion.getConvertedPoints(),
                conversion.getSeoulPayAmount(),
                conversion.getCreatedAt()
        );
    }
}
