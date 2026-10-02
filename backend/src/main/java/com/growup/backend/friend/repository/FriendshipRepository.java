package com.growup.backend.friend.repository;

import com.growup.backend.friend.domain.Friendship;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    List<Friendship> findAllByUserId(Long userId);
}