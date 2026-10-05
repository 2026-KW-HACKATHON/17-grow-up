package com.growup.backend.mission.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.global.security.Role;
import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.domain.MissionCategory;
import com.growup.backend.mission.domain.MissionCompletion;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.mission.repository.MissionRepository;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class MissionApiIntegrationTest {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final Long ACCOUNT_ID = 1L;
    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private MissionCompletionRepository missionCompletionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void cleanDatabase() {
        missionCompletionRepository.deleteAll();
        missionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @AfterEach
    void cleanUp() {
        cleanDatabase();
    }

    @Test
    void userGetsActiveMissionsInIdOrderWithExpectedFields() throws Exception {
        Mission tumbler = saveMission(
                "텀블러 사용",
                "일회용 컵 대신 텀블러를 사용합니다.",
                MissionCategory.REUSABLE,
                230L,
                500L,
                true
        );
        Mission foodWaste = saveMission(
                "음식 남기지 않기",
                "먹을 만큼만 담고 음식을 남기지 않습니다.",
                MissionCategory.FOOD_WASTE,
                5L,
                100L,
                true
        );

        mockMvc.perform(get("/api/v1/missions")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].missionId").value(tumbler.getId()))
                .andExpect(jsonPath("$.data[0].name").value("텀블러 사용"))
                .andExpect(jsonPath("$.data[0].category").value("REUSABLE"))
                .andExpect(jsonPath("$.data[0].carbonReductionG").value(230))
                .andExpect(jsonPath("$.data[0].rewardPoints").value(500))
                .andExpect(jsonPath("$.data[0].completedToday").value(false))
                .andExpect(jsonPath("$.data[1].missionId").value(foodWaste.getId()))
                .andExpect(jsonPath("$.data[1].category").value("FOOD_WASTE"))
                .andExpect(jsonPath("$.data[1].carbonReductionG").value(5))
                .andExpect(jsonPath("$.data[1].rewardPoints").value(100))
                .andExpect(jsonPath("$.data[1].completedToday").value(false));
    }

    @Test
    void inactiveMissionIsExcludedFromList() throws Exception {
        Mission activeMission = saveMission(
                "장바구니 사용",
                "비닐봉지 대신 장바구니를 사용합니다.",
                MissionCategory.REUSABLE,
                47L,
                true
        );
        saveMission(
                "비활성 미션",
                "노출되지 않는 미션입니다.",
                MissionCategory.REUSABLE,
                100L,
                false
        );

        mockMvc.perform(get("/api/v1/missions")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].missionId").value(activeMission.getId()))
                .andExpect(jsonPath("$.data[0].name").value("장바구니 사용"));
    }

    @Test
    void userGetsActiveMissionDetail() throws Exception {
        Mission mission = saveMission(
                "텀블러 사용",
                "일회용 컵 대신 텀블러를 사용합니다.",
                MissionCategory.REUSABLE,
                230L,
                500L,
                true
        );

        mockMvc.perform(get("/api/v1/missions/{missionId}", mission.getId())
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.missionId").value(mission.getId()))
                .andExpect(jsonPath("$.data.name").value("텀블러 사용"))
                .andExpect(jsonPath("$.data.description")
                        .value("일회용 컵 대신 텀블러를 사용합니다."))
                .andExpect(jsonPath("$.data.category").value("REUSABLE"))
                .andExpect(jsonPath("$.data.carbonReductionG").value(230))
                .andExpect(jsonPath("$.data.rewardPoints").value(500))
                .andExpect(jsonPath("$.data.completedToday").value(false));
    }

    @Test
    void unknownMissionReturnsMissionNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/missions/{missionId}", 999_999L)
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("MISSION_NOT_FOUND"))
                .andExpect(jsonPath("$.error.message").value("미션을 찾을 수 없습니다."));
    }

    @Test
    void inactiveMissionDetailReturnsMissionNotFound() throws Exception {
        Mission inactiveMission = saveMission(
                "비활성 미션",
                "노출되지 않는 미션입니다.",
                MissionCategory.REUSABLE,
                100L,
                false
        );

        mockMvc.perform(get("/api/v1/missions/{missionId}", inactiveMission.getId())
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("MISSION_NOT_FOUND"));
    }

    @Test
    void unauthenticatedRequestReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/missions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void partnerRoleCannotAccessMissionEndpoint() throws Exception {
        String partnerToken = BEARER_PREFIX
                + jwtTokenProvider.createAccessToken(ACCOUNT_ID, Role.PARTNER);

        mockMvc.perform(get("/api/v1/missions")
                        .header(HttpHeaders.AUTHORIZATION, partnerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    @Test
    void missionListReflectsOnlyCurrentUsersCompletionsToday() throws Exception {
        User currentUser = saveUser("current-user", "INVITE01");
        User otherUser = saveUser("other-user", "INVITE02");
        Mission completedMission = saveMission(
                "텀블러 사용",
                "일회용 컵 대신 텀블러를 사용합니다.",
                MissionCategory.REUSABLE,
                230L,
                true
        );
        Mission incompleteMission = saveMission(
                "장바구니 사용",
                "비닐봉지 대신 장바구니를 사용합니다.",
                MissionCategory.REUSABLE,
                47L,
                true
        );
        saveCompletion(currentUser, completedMission, LocalDate.now(KST_ZONE_ID));
        saveCompletion(otherUser, incompleteMission, LocalDate.now(KST_ZONE_ID));

        mockMvc.perform(get("/api/v1/missions")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                userBearerToken(currentUser.getId())
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].missionId").value(completedMission.getId()))
                .andExpect(jsonPath("$.data[0].completedToday").value(true))
                .andExpect(jsonPath("$.data[1].missionId").value(incompleteMission.getId()))
                .andExpect(jsonPath("$.data[1].completedToday").value(false));
    }

    @Test
    void missionDetailReflectsCompletedAndIncompleteStatusToday() throws Exception {
        User user = saveUser("current-user", "INVITE01");
        Mission completedMission = saveMission(
                "텀블러 사용",
                "일회용 컵 대신 텀블러를 사용합니다.",
                MissionCategory.REUSABLE,
                230L,
                true
        );
        Mission incompleteMission = saveMission(
                "장바구니 사용",
                "비닐봉지 대신 장바구니를 사용합니다.",
                MissionCategory.REUSABLE,
                47L,
                true
        );
        saveCompletion(user, completedMission, LocalDate.now(KST_ZONE_ID));
        String token = userBearerToken(user.getId());

        mockMvc.perform(get("/api/v1/missions/{missionId}", completedMission.getId())
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedToday").value(true));

        mockMvc.perform(get("/api/v1/missions/{missionId}", incompleteMission.getId())
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedToday").value(false));
    }

    private Mission saveMission(
            String name,
            String description,
            MissionCategory category,
            long carbonReductionG,
            boolean active
    ) {
        return saveMission(name, description, category, carbonReductionG, 100L, active);
    }

    private Mission saveMission(
            String name,
            String description,
            MissionCategory category,
            long carbonReductionG,
            long rewardPoints,
            boolean active
    ) {
        return missionRepository.saveAndFlush(
                Mission.create(
                        name,
                        description,
                        category,
                        carbonReductionG,
                        rewardPoints,
                        active
                )
        );
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

    private void saveCompletion(User user, Mission mission, LocalDate completedDate) {
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(user, mission, completedDate)
        );
    }

    private String userBearerToken() {
        return userBearerToken(ACCOUNT_ID);
    }

    private String userBearerToken(Long accountId) {
        return BEARER_PREFIX + jwtTokenProvider.createAccessToken(accountId, Role.USER);
    }
}
