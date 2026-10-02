package com.growup.backend.friend.service;

import com.growup.backend.friend.dto.FriendListResponse;
import com.growup.backend.friend.dto.FriendResponse;
import com.growup.backend.friend.repository.FriendshipRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {

    private final FriendshipRepository friendshipRepository;

    public FriendListResponse getFriends(Long userId) {
        List<FriendResponse> friends = friendshipRepository.findAllByUserId(userId)
                .stream()
                .map(friendship -> FriendResponse.from(friendship.getFriend()))
                .toList();

        return new FriendListResponse(friends);
    }
}