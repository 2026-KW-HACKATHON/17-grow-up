package com.growup.backend.friend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class FriendResponseTest {

    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");

    @Test
    void expiredStreakIsCalculatedUsingKstDate() {
        User friend = User.create(
                "friend",
                "hashed-password",
                "친구",
                "FRIEND01",
                CharacterType.TREE_A
        );
        LocalDate today = LocalDate.now(KST_ZONE_ID);
        friend.completeMission(100L, 100L, today.minusDays(2));

        FriendResponse response = FriendResponse.from(friend);

        assertThat(response.currentStreak()).isZero();
    }
}
