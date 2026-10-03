package com.growup.backend.record.dto;

import java.util.List;

public record RecordHistoryResponse(
        List<RecordHistoryItemResponse> records
) {
}