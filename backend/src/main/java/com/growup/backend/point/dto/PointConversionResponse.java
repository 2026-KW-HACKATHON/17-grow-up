package com.growup.backend.point.dto;

import com.growup.backend.point.domain.PointConversion;
import java.time.LocalDateTime;

public record PointConversionResponse(
        Long conversionId,
        long convertedPoints,
        long seoulPayAmount,
        long remainingPoints,
        LocalDateTime createdAt
) {
    public static PointConversionResponse from(
            PointConversion conversion,
            long remainingPoints
    ) {
        return new PointConversionResponse(
                conversion.getId(),
                conversion.getConvertedPoints(),
                conversion.getSeoulPayAmount(),
                remainingPoints,
                conversion.getCreatedAt()
        );
    }
}
