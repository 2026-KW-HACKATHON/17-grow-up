package com.growup.backend.user.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = User.create(
                "growup",
                "hashed-password",
                "새싹이",
                "ABCDEFGH",
                CharacterType.TREE_A
        );
    }

    @Test
    void firstMissionCompletionAddsCarbonAndStartsStreak() {
        LocalDate completedDate = LocalDate.of(2026, 10, 4);

        user.completeMission(230L, completedDate);

        assertThat(user.getTotalCarbonG()).isEqualTo(230L);
        assertThat(user.getConvertibleCarbonG()).isEqualTo(230L);
        assertThat(user.getCurrentStreak()).isEqualTo(1);
        assertThat(user.getLongestStreak()).isEqualTo(1);
        assertThat(user.getLastPracticeDate()).isEqualTo(completedDate);
    }

    @Test
    void anotherMissionOnSameDateAddsCarbonWithoutIncreasingStreak() {
        LocalDate completedDate = LocalDate.of(2026, 10, 4);
        user.completeMission(230L, completedDate);

        user.completeMission(47L, completedDate);

        assertThat(user.getTotalCarbonG()).isEqualTo(277L);
        assertThat(user.getConvertibleCarbonG()).isEqualTo(277L);
        assertThat(user.getCurrentStreak()).isEqualTo(1);
        assertThat(user.getLongestStreak()).isEqualTo(1);
    }

    @Test
    void missionOnNextDateIncreasesStreak() {
        LocalDate firstDate = LocalDate.of(2026, 10, 3);
        user.completeMission(230L, firstDate);

        user.completeMission(47L, firstDate.plusDays(1));

        assertThat(user.getCurrentStreak()).isEqualTo(2);
        assertThat(user.getLongestStreak()).isEqualTo(2);
        assertThat(user.getLastPracticeDate()).isEqualTo(firstDate.plusDays(1));
    }

    @Test
    void missionAfterGapRestartsCurrentStreakAndKeepsLongestStreak() {
        LocalDate firstDate = LocalDate.of(2026, 10, 1);
        user.completeMission(230L, firstDate);
        user.completeMission(47L, firstDate.plusDays(1));

        user.completeMission(200L, firstDate.plusDays(3));

        assertThat(user.getCurrentStreak()).isEqualTo(1);
        assertThat(user.getLongestStreak()).isEqualTo(2);
        assertThat(user.getLastPracticeDate()).isEqualTo(firstDate.plusDays(3));
    }

    @Test
    void olderCompletionDoesNotChangeCurrentStreakOrLastPracticeDate() {
        LocalDate latestDate = LocalDate.of(2026, 10, 4);
        user.completeMission(230L, latestDate.minusDays(1));
        user.completeMission(47L, latestDate);

        user.completeMission(200L, latestDate.minusDays(3));

        assertThat(user.getTotalCarbonG()).isEqualTo(477L);
        assertThat(user.getCurrentStreak()).isEqualTo(2);
        assertThat(user.getLongestStreak()).isEqualTo(2);
        assertThat(user.getLastPracticeDate()).isEqualTo(latestDate);
    }

    @Test
    void negativeCarbonReductionIsRejectedWithoutChangingUser() {
        assertThatThrownBy(() -> user.completeMission(-1L, LocalDate.of(2026, 10, 4)))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(user.getTotalCarbonG()).isZero();
        assertThat(user.getConvertibleCarbonG()).isZero();
        assertThat(user.getCurrentStreak()).isZero();
        assertThat(user.getLastPracticeDate()).isNull();
    }
}
