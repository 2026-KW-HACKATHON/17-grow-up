package com.growup.backend.mission.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.domain.MissionCategory;
import com.growup.backend.mission.domain.MissionCompletion;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

@SpringBootTest
class MissionCompletionRepositoryIntegrationTest {

    private static final LocalDate COMPLETED_DATE = LocalDate.of(2026, 10, 2);

    @Autowired
    private MissionCompletionRepository missionCompletionRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    @Test
    void savesMissionCompletion() {
        User user = saveUser("user1", "INVITE01");
        Mission mission = saveMission("텀블러 사용");

        MissionCompletion completion = missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(user, mission, COMPLETED_DATE)
        );

        assertThat(completion.getId()).isNotNull();
        assertThat(completion.getUser().getId()).isEqualTo(user.getId());
        assertThat(completion.getMission().getId()).isEqualTo(mission.getId());
        assertThat(completion.getCompletedDate()).isEqualTo(COMPLETED_DATE);
        assertThat(completion.getCompletedAt()).isNotNull();
        assertThat(missionCompletionRepository
                .existsByUserIdAndMissionIdAndCompletedDate(
                        user.getId(),
                        mission.getId(),
                        COMPLETED_DATE
                )).isTrue();
    }

    @Test
    void rejectsDuplicateUserMissionAndDate() {
        User user = saveUser("user1", "INVITE01");
        Mission mission = saveMission("텀블러 사용");
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(user, mission, COMPLETED_DATE)
        );

        assertThatThrownBy(() -> missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(user, mission, COMPLETED_DATE)
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void allowsDifferentMissionsOnSameDate() {
        User user = saveUser("user1", "INVITE01");
        Mission firstMission = saveMission("텀블러 사용");
        Mission secondMission = saveMission("장바구니 사용");

        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(user, firstMission, COMPLETED_DATE)
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(user, secondMission, COMPLETED_DATE)
        );

        assertThat(missionCompletionRepository.count()).isEqualTo(2L);
    }

    @Test
    void allowsSameMissionOnDifferentDates() {
        User user = saveUser("user1", "INVITE01");
        Mission mission = saveMission("텀블러 사용");

        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(user, mission, COMPLETED_DATE)
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(user, mission, COMPLETED_DATE.plusDays(1))
        );

        assertThat(missionCompletionRepository.count()).isEqualTo(2L);
    }

    @Test
    void allowsDifferentUsersToCompleteSameMissionOnSameDate() {
        User firstUser = saveUser("user1", "INVITE01");
        User secondUser = saveUser("user2", "INVITE02");
        Mission mission = saveMission("텀블러 사용");

        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(firstUser, mission, COMPLETED_DATE)
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(secondUser, mission, COMPLETED_DATE)
        );

        assertThat(missionCompletionRepository.count()).isEqualTo(2L);
    }

    @Test
    void createRejectsNullRequiredValues() {
        User user = saveUser("user1", "INVITE01");
        Mission mission = saveMission("텀블러 사용");

        assertThatThrownBy(() -> MissionCompletion.create(null, mission, COMPLETED_DATE))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("user는 필수입니다.");
        assertThatThrownBy(() -> MissionCompletion.create(user, null, COMPLETED_DATE))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("mission은 필수입니다.");
        assertThatThrownBy(() -> MissionCompletion.create(user, mission, null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("completedDate는 필수입니다.");
    }

    @Test
    void findsCompletedMissionIdsForUserAndDateOnly() {
        User currentUser = saveUser("user1", "INVITE01");
        User otherUser = saveUser("user2", "INVITE02");
        Mission firstMission = saveMission("텀블러 사용");
        Mission secondMission = saveMission("장바구니 사용");
        Mission excludedMission = saveMission("다회용기 포장");

        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(currentUser, firstMission, COMPLETED_DATE)
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(currentUser, secondMission, COMPLETED_DATE)
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(currentUser, excludedMission, COMPLETED_DATE.plusDays(1))
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(otherUser, excludedMission, COMPLETED_DATE)
        );

        List<Long> missionIds = missionCompletionRepository
                .findCompletedMissionIdsByUserIdAndCompletedDate(
                        currentUser.getId(),
                        COMPLETED_DATE
                );

        assertThat(missionIds)
                .containsExactlyInAnyOrder(firstMission.getId(), secondMission.getId());
    }

    private User saveUser(String loginId, String inviteCode) {
        return userRepository.saveAndFlush(User.create(
                loginId,
                "hashed-password",
                loginId,
                inviteCode,
                CharacterType.TREE_A
        ));
    }

    private Mission saveMission(String name) {
        return missionRepository.saveAndFlush(Mission.create(
                name,
                name + " 설명",
                MissionCategory.REUSABLE,
                100L,
                100L,
                true
        ));
    }

    private void cleanDatabase() {
        missionCompletionRepository.deleteAll();
        missionRepository.deleteAll();
        userRepository.deleteAll();
    }
}
