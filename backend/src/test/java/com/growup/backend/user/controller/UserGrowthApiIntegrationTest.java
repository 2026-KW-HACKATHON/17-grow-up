package com.growup.backend.user.controller;

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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class UserGrowthApiIntegrationTest {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private MissionCompletionRepository missionCompletionRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    @Test
    void getsCharacterGrowthAndOwnMissionStats() throws Exception {
        User currentUser = saveUser("growup", "ABCDEFGH", 3_900L);
        User otherUser = saveUser("other", "HGFEDCBA", 20_700L);
        Mission tumbler = saveMission("텀블러 사용하기");
        Mission bag = saveMission("장바구니 사용하기");
        LocalDate today = LocalDate.now(KST_ZONE_ID);

        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(currentUser, tumbler, today)
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(currentUser, tumbler, today.minusDays(1))
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(currentUser, bag, today.minusDays(2))
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(otherUser, tumbler, today)
        );

        mockMvc.perform(get("/api/v1/users/me/growth")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                userBearerToken(currentUser.getId())
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.characterType").value("TREE_A"))
                .andExpect(jsonPath("$.data.characterLevel").value(2))
                .andExpect(jsonPath("$.data.totalCarbonG").value(3_900))
                .andExpect(jsonPath("$.data.currentLevelMinCarbonG").value(1_610))
                .andExpect(jsonPath("$.data.nextLevelCarbonG").value(6_900))
                .andExpect(jsonPath("$.data.remainingCarbonG").value(3_000))
                .andExpect(jsonPath("$.data.progressPercent").value(43.29))
                .andExpect(jsonPath("$.data.totalMissionCount").value(3))
                .andExpect(jsonPath("$.data.missionStats.length()").value(2))
                .andExpect(jsonPath("$.data.missionStats[0].missionId")
                        .value(tumbler.getId()))
                .andExpect(jsonPath("$.data.missionStats[0].missionName")
                        .value("텀블러 사용하기"))
                .andExpect(jsonPath("$.data.missionStats[0].count").value(2))
                .andExpect(jsonPath("$.data.missionStats[0].percentage").value(66.67))
                .andExpect(jsonPath("$.data.missionStats[1].missionId").value(bag.getId()))
                .andExpect(jsonPath("$.data.missionStats[1].count").value(1))
                .andExpect(jsonPath("$.data.missionStats[1].percentage").value(33.33));
    }

    @Test
    void userWithoutCompletionsGetsEmptyMissionStats() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 0L);

        mockMvc.perform(get("/api/v1/users/me/growth")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.characterLevel").value(1))
                .andExpect(jsonPath("$.data.progressPercent").value(0.0))
                .andExpect(jsonPath("$.data.totalMissionCount").value(0))
                .andExpect(jsonPath("$.data.missionStats").isEmpty());
    }

    @Test
    void unauthenticatedRequestReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/growth"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void partnerRequestReturnsForbidden() throws Exception {
        String partnerToken = BEARER_PREFIX
                + jwtTokenProvider.createAccessToken(1L, Role.PARTNER);

        mockMvc.perform(get("/api/v1/users/me/growth")
                        .header(HttpHeaders.AUTHORIZATION, partnerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    private User saveUser(String loginId, String inviteCode, long totalCarbonG) {
        User user = User.create(
                loginId,
                "hashed-password",
                "새싹이",
                inviteCode,
                CharacterType.TREE_A
        );
        ReflectionTestUtils.setField(user, "totalCarbonG", totalCarbonG);
        return userRepository.saveAndFlush(user);
    }

    private Mission saveMission(String name) {
        return missionRepository.saveAndFlush(Mission.create(
                name,
                name + " 설명",
                MissionCategory.REUSABLE,
                100L,
                500L,
                true
        ));
    }

    private String userBearerToken(Long userId) {
        return BEARER_PREFIX + jwtTokenProvider.createAccessToken(userId, Role.USER);
    }

    private void cleanDatabase() {
        missionCompletionRepository.deleteAll();
        missionRepository.deleteAll();
        userRepository.deleteAll();
    }
}
