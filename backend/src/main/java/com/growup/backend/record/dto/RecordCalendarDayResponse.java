package com.growup.backend.record.dto;

import java.time.LocalDate;

public record RecordCalendarDayResponse(
        LocalDate date,
        long missionCount
) {
}