package com.growup.backend.friend.service;

import com.growup.backend.friend.dto.FriendInviteResponse;
import com.growup.backend.friend.dto.FriendListResponse;
import com.growup.backend.friend.dto.FriendResponse;
import com.growup.backend.friend.repository.FriendshipRepository;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    @Value("${app.invite.base-url:http://localhost:5173/invite}")
    private String inviteBaseUrl;

    public FriendListResponse getFriends(Long userId) {
        List<FriendResponse> friends = friendshipRepository.findAllByUserId(userId)
                .stream()
                .map(friendship -> FriendResponse.from(friendship.getFriend()))
                .toList();

        return new FriendListResponse(friends);
    }

    public FriendInviteResponse getInviteLink(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow();

        String inviteUrl = inviteBaseUrl + "/" + user.getInviteCode();

        return new FriendInviteResponse(inviteUrl);
    }
}