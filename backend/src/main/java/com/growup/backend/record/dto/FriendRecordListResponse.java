package com.growup.backend.record.dto;

import java.util.List;

public record FriendRecordListResponse(
        List<FriendRecordResponse> friends
) {
}