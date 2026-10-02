package com.growup.backend.friend.dto;

import java.util.List;

public record FriendListResponse(
        List<FriendResponse> friends
) {
}