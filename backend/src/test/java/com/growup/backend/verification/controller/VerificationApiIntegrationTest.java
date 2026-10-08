package com.growup.backend.verification.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.global.security.Role;
import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.domain.MissionCategory;
import com.growup.backend.mission.domain.MissionCompletion;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.mission.repository.MissionRepository;
import com.growup.backend.partner.domain.Partner;
import com.growup.backend.partner.domain.PartnerAccount;
import com.growup.backend.partner.repository.PartnerAccountRepository;
import com.growup.backend.partner.repository.PartnerRepository;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.stream.Stream;

@SpringBootTest
@AutoConfigureMockMvc
class VerificationApiIntegrationTest {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String TEST_SECRET =
            "dGVzdC1qd3Qtc2VjcmV0LWtleS10aGF0LWlzLWF0LWxlYXN0LTMyLWJ5dGVzLWxvbmc=";
    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private MissionCompletionRepository missionCompletionRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private PartnerAccountRepository partnerAccountRepository;

    private PartnerAccount partnerAccount;

    @BeforeEach
    void setUp() {
        cleanDatabase();
        Partner partner = partnerRepository.saveAndFlush(Partner.create("그루업 테스트 카페"));
        partnerAccount = partnerAccountRepository.saveAndFlush(PartnerAccount.create(
                "partner",
                "hashed-password",
                true,
                partner
        ));
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    @Test
    void partnerVerifiesMissionWithValidQrToken() throws Exception {
        User user = saveUser();
        Mission mission = saveMission(true);
        LocalDate dateBeforeRequest = LocalDate.now(KST_ZONE_ID);

        String responseBody = mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, partnerBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody(
                                jwtTokenProvider.createQrToken(user.getId()),
                                mission.getId()
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.missionCompletionId").isNumber())
                .andExpect(jsonPath("$.data.userId").value(user.getId()))
                .andExpect(jsonPath("$.data.missionId").value(mission.getId()))
                .andExpect(jsonPath("$.data.pointsAwarded").value(500))
                .andExpect(jsonPath("$.data.availablePoints").value(500))
                .andReturn()
                .getResponse()
                .getContentAsString();

        LocalDate dateAfterRequest = LocalDate.now(KST_ZONE_ID);
        LocalDate responseDate = LocalDate.parse(
                JsonPath.read(responseBody, "$.data.completedDate")
        );
        assertThat(responseDate).isIn(dateBeforeRequest, dateAfterRequest);

        MissionCompletion completion = missionCompletionRepository
                .findPointHistoryByUserId(user.getId())
                .getFirst();
        assertThat(completion.getUser().getId()).isEqualTo(user.getId());
        assertThat(completion.getMission().getId()).isEqualTo(mission.getId());
        assertThat(completion.getPartner().getId())
                .isEqualTo(partnerAccount.getPartner().getId());
        assertThat(completion.getPartner().getName()).isEqualTo("그루업 테스트 카페");
        assertThat(completion.getCompletedDate()).isEqualTo(responseDate);

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updatedUser.getTotalCarbonG()).isEqualTo(230L);
        assertThat(updatedUser.getConvertibleCarbonG()).isZero();
        assertThat(updatedUser.getAvailablePoints()).isEqualTo(500L);
        assertThat(updatedUser.getTotalEarnedPoints()).isEqualTo(500L);
        assertThat(updatedUser.getCurrentStreak()).isEqualTo(1);
        assertThat(updatedUser.getLongestStreak()).isEqualTo(1);
        assertThat(updatedUser.getLastPracticeDate()).isEqualTo(responseDate);
    }

    @ParameterizedTest
    @CsvSource({
            "텀블러 사용하기, 230, 500",
            "장바구니 사용하기, 47, 200",
            "포장 시 다회용기 사용하기, 200, 500",
            "음식 안 남기기, 5, 100",
            "일회용 수저·포크 사용 안 하기, 110, 300"
    })
    void verificationAwardsPointsConfiguredOnMission(
            String missionName,
            long carbonReductionG,
            long rewardPoints
    ) throws Exception {
        User user = saveUser();
        Mission mission = saveMission(
                missionName,
                carbonReductionG,
                rewardPoints,
                true
        );

        mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, partnerBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody(
                                jwtTokenProvider.createQrToken(user.getId()),
                                mission.getId()
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pointsAwarded").value(rewardPoints))
                .andExpect(jsonPath("$.data.availablePoints").value(rewardPoints));

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updatedUser.getTotalCarbonG()).isEqualTo(carbonReductionG);
        assertThat(updatedUser.getConvertibleCarbonG()).isZero();
        assertThat(updatedUser.getAvailablePoints()).isEqualTo(rewardPoints);
        assertThat(updatedUser.getTotalEarnedPoints()).isEqualTo(rewardPoints);
    }

    @Test
    void tamperedQrTokenReturnsInvalidQrToken() throws Exception {
        String qrToken = jwtTokenProvider.createQrToken(1L);
        String tamperedToken = qrToken.substring(0, qrToken.length() - 1)
                + (qrToken.endsWith("a") ? "b" : "a");

        expectInvalidQrToken(tamperedToken);
    }

    @Test
    void expiredQrTokenReturnsExpiredQrToken() throws Exception {
        JwtTokenProvider expiredQrTokenProvider = new JwtTokenProvider(
                TEST_SECRET,
                3_600L,
                -1L
        );

        mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, partnerBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody(
                                expiredQrTokenProvider.createQrToken(1L),
                                1L
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("EXPIRED_QR_TOKEN"));
    }

    @Test
    void accessTokenCannotBeUsedAsQrToken() throws Exception {
        String accessToken = jwtTokenProvider.createAccessToken(1L, Role.USER);

        expectInvalidQrToken(accessToken);
    }

    @Test
    void missingQrUserReturnsUserNotFound() throws Exception {
        mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, partnerBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody(
                                jwtTokenProvider.createQrToken(999_999L),
                                1L
                        )))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("USER_NOT_FOUND"));
    }

    @Test
    void missingMissionReturnsMissionNotFound() throws Exception {
        User user = saveUser();

        mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, partnerBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody(
                                jwtTokenProvider.createQrToken(user.getId()),
                                999_999L
                        )))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("MISSION_NOT_FOUND"));
    }

    @Test
    void inactiveMissionReturnsMissionNotFound() throws Exception {
        User user = saveUser();
        Mission inactiveMission = saveMission(false);

        mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, partnerBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody(
                                jwtTokenProvider.createQrToken(user.getId()),
                                inactiveMission.getId()
                        )))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("MISSION_NOT_FOUND"));
    }

    @Test
    void alreadyCompletedMissionReturnsConflict() throws Exception {
        User user = saveUser();
        Mission mission = saveMission(true);
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(user, mission, LocalDate.now(KST_ZONE_ID))
        );

        mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, partnerBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody(
                                jwtTokenProvider.createQrToken(user.getId()),
                                mission.getId()
                        )))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("MISSION_ALREADY_COMPLETED"));

        User unchangedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(unchangedUser.getTotalCarbonG()).isZero();
        assertThat(unchangedUser.getAvailablePoints()).isZero();
        assertThat(unchangedUser.getTotalEarnedPoints()).isZero();
    }

    @Test
    void userRoleCannotCallVerification() throws Exception {
        mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody("qr-token", 1L)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    @Test
    void unauthenticatedRequestReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/verifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody("qr-token", 1L)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @ParameterizedTest
    @MethodSource("invalidVerificationRequests")
    void invalidRequestReturnsValidationError(String requestBody) throws Exception {
        mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, partnerBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    private void expectInvalidQrToken(String qrToken) throws Exception {
        mockMvc.perform(post("/api/v1/verifications")
                        .header(HttpHeaders.AUTHORIZATION, partnerBearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verificationBody(qrToken, 1L)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INVALID_QR_TOKEN"));
    }

    private User saveUser() {
        return userRepository.saveAndFlush(User.create(
                "growup",
                "hashed-password",
                "새싹이",
                "ABCDEFGH",
                CharacterType.TREE_A
        ));
    }

    private Mission saveMission(boolean active) {
        return saveMission("텀블러 사용하기", 230L, 500L, active);
    }

    private Mission saveMission(
            String name,
            long carbonReductionG,
            long rewardPoints,
            boolean active
    ) {
        return missionRepository.saveAndFlush(Mission.create(
                name,
                name + " 미션 설명",
                MissionCategory.REUSABLE,
                carbonReductionG,
                rewardPoints,
                active
        ));
    }

    private String verificationBody(String qrToken, Long missionId) {
        return """
                {
                  "qrToken": "%s",
                  "missionId": %d
                }
                """.formatted(qrToken, missionId);
    }

    private String partnerBearerToken() {
        return BEARER_PREFIX
                + jwtTokenProvider.createAccessToken(partnerAccount.getId(), Role.PARTNER);
    }

    private String userBearerToken() {
        return BEARER_PREFIX + jwtTokenProvider.createAccessToken(20L, Role.USER);
    }

    private void cleanDatabase() {
        missionCompletionRepository.deleteAll();
        partnerAccountRepository.deleteAll();
        partnerRepository.deleteAll();
        missionRepository.deleteAll();
        userRepository.deleteAll();
    }

    private static Stream<String> invalidVerificationRequests() {
        return Stream.of(
                """
                        {"qrToken": null, "missionId": 1}
                        """,
                """
                        {"qrToken": "", "missionId": 1}
                        """,
                """
                        {"qrToken": "   ", "missionId": 1}
                        """,
                """
                        {"qrToken": "qr-token", "missionId": null}
                        """
        );
    }
}
