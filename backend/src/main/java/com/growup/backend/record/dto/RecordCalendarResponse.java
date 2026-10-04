package com.growup.backend.record.dto;

import java.util.List;

public record RecordCalendarResponse(
        int year,
        int month,
        List<RecordCalendarDayResponse> practiceDays
) {
}