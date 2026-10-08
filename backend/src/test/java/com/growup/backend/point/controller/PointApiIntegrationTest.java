package com.growup.backend.point.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.global.security.Role;
import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.domain.MissionCategory;
import com.growup.backend.mission.domain.MissionCompletion;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.mission.repository.MissionRepository;
import com.growup.backend.partner.domain.Partner;
import com.growup.backend.partner.repository.PartnerRepository;
import com.growup.backend.point.domain.PointConversion;
import com.growup.backend.point.dto.PointConversionRequest;
import com.growup.backend.point.repository.PointConversionRepository;
import com.growup.backend.point.service.PointService;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PointApiIntegrationTest {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PointConversionRepository pointConversionRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private MissionCompletionRepository missionCompletionRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PointService pointService;

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
    void convertsTwentyThousandPointsAndSavesHistory() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 30_000L);

        mockMvc.perform(post("/api/v1/points/conversions")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "points": 20000
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.conversionId").isNumber())
                .andExpect(jsonPath("$.data.convertedPoints").value(20_000))
                .andExpect(jsonPath("$.data.seoulPayAmount").value(200))
                .andExpect(jsonPath("$.data.remainingPoints").value(10_000))
                .andExpect(jsonPath("$.data.createdAt").isNotEmpty());

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updatedUser.getTotalCarbonG()).isEqualTo(230L);
        assertThat(updatedUser.getConvertibleCarbonG()).isZero();
        assertThat(updatedUser.getAvailablePoints()).isEqualTo(10_000L);
        assertThat(updatedUser.getTotalEarnedPoints()).isEqualTo(30_000L);

        List<PointConversion> conversions = pointConversionRepository.findAll();
        assertThat(conversions).hasSize(1);
        assertThat(conversions.getFirst().getUser().getId()).isEqualTo(user.getId());
        assertThat(conversions.getFirst().getConvertedPoints()).isEqualTo(20_000L);
        assertThat(conversions.getFirst().getSeoulPayAmount()).isEqualTo(200L);
    }

    @Test
    void convertsTenThousandPointsToOneHundredWon() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 10_000L);

        mockMvc.perform(post("/api/v1/points/conversions")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "points": 10000
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.seoulPayAmount").value(100));

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updatedUser.getTotalCarbonG()).isEqualTo(230L);
        assertThat(updatedUser.getConvertibleCarbonG()).isZero();
        assertThat(updatedUser.getAvailablePoints()).isZero();
        assertThat(updatedUser.getTotalEarnedPoints()).isEqualTo(10_000L);
    }

    @Test
    void insufficientPointsReturnConflictWithoutChangingUserOrSavingHistory() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 10_000L);

        mockMvc.perform(post("/api/v1/points/conversions")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "points": 20000
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INSUFFICIENT_POINTS"));

        User unchangedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(unchangedUser.getTotalCarbonG()).isEqualTo(230L);
        assertThat(unchangedUser.getConvertibleCarbonG()).isZero();
        assertThat(unchangedUser.getAvailablePoints()).isEqualTo(10_000L);
        assertThat(unchangedUser.getTotalEarnedPoints()).isEqualTo(10_000L);
        assertThat(pointConversionRepository.count()).isZero();
    }

    @Test
    void pointsBelowMinimumReturnValidationError() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 10_000L);

        expectValidationError(user, 9_999L);

        assertThat(pointConversionRepository.count()).isZero();
    }

    @Test
    void pointsThatAreNotTenThousandUnitReturnValidationError() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 20_000L);

        expectValidationError(user, 15_000L);

        assertThat(pointConversionRepository.count()).isZero();
    }

    @Test
    void getsOnlyOwnConversionsInNewestOrder() throws Exception {
        User currentUser = saveUser("growup", "ABCDEFGH", 30_000L);
        User otherUser = saveUser("other", "HGFEDCBA", 10_000L);
        PointConversion first = pointConversionRepository.saveAndFlush(
                PointConversion.create(currentUser, 10_000L, 100L)
        );
        PointConversion second = pointConversionRepository.saveAndFlush(
                PointConversion.create(currentUser, 20_000L, 200L)
        );
        pointConversionRepository.saveAndFlush(
                PointConversion.create(otherUser, 10_000L, 100L)
        );

        mockMvc.perform(get("/api/v1/points/conversions")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken(currentUser.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.conversions.length()").value(2))
                .andExpect(jsonPath("$.data.conversions[0].conversionId").value(second.getId()))
                .andExpect(jsonPath("$.data.conversions[0].convertedPoints").value(20_000))
                .andExpect(jsonPath("$.data.conversions[1].conversionId").value(first.getId()))
                .andExpect(jsonPath("$.data.conversions[1].convertedPoints").value(10_000));
    }

    @Test
    void userWithoutConversionsGetsEmptyList() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 0L);

        mockMvc.perform(get("/api/v1/points/conversions")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.conversions").isArray())
                .andExpect(jsonPath("$.data.conversions").isEmpty());
    }

    @Test
    void getsOwnPointEarningHistoryWithMonthlyTotalAndPartner() throws Exception {
        User currentUser = saveUser("growup", "ABCDEFGH", 1_230L);
        User otherUser = saveUser("other", "HGFEDCBA", 0L);
        Mission tumbler = saveMission("텀블러 사용하기", 500L);
        Mission bag = saveMission("장바구니 사용하기", 200L);
        Mission cutlery = saveMission("일회용 수저·포크 사용 안 하기", 300L);
        Partner partner = partnerRepository.saveAndFlush(Partner.create("월계동 그린카페"));
        YearMonth currentMonth = YearMonth.now(KST_ZONE_ID);
        LocalDate today = LocalDate.now(KST_ZONE_ID);

        MissionCompletion previousMonth = missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(
                        currentUser,
                        cutlery,
                        partner,
                        currentMonth.minusMonths(1).atEndOfMonth()
                )
        );
        MissionCompletion legacyCompletion = missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(currentUser, bag, currentMonth.atDay(1))
        );
        MissionCompletion newest = missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(currentUser, tumbler, partner, today)
        );
        missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(otherUser, tumbler, partner, today)
        );

        setCompletedAt(previousMonth, LocalDateTime.of(2026, 9, 30, 10, 0));
        setCompletedAt(legacyCompletion, LocalDateTime.of(2026, 10, 8, 10, 0));
        setCompletedAt(newest, LocalDateTime.of(2026, 10, 8, 10, 0));

        mockMvc.perform(get("/api/v1/points/history")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                userBearerToken(currentUser.getId())
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.availablePoints").value(1_230))
                .andExpect(jsonPath("$.data.monthlyEarnedPoints").value(700))
                .andExpect(jsonPath("$.data.histories.length()").value(3))
                .andExpect(jsonPath("$.data.histories[0].missionId").value(tumbler.getId()))
                .andExpect(jsonPath("$.data.histories[0].missionName")
                        .value("텀블러 사용하기"))
                .andExpect(jsonPath("$.data.histories[0].partnerName")
                        .value("월계동 그린카페"))
                .andExpect(jsonPath("$.data.histories[0].earnedPoints").value(500))
                .andExpect(jsonPath("$.data.histories[0].earnedAt")
                        .value("2026-10-08T10:00:00"))
                .andExpect(jsonPath("$.data.histories[1].missionId").value(bag.getId()))
                .andExpect(jsonPath("$.data.histories[1].partnerName").doesNotExist())
                .andExpect(jsonPath("$.data.histories[2].missionId").value(cutlery.getId()));
    }

    @Test
    void userWithoutMissionCompletionsGetsEmptyPointHistory() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 0L);

        mockMvc.perform(get("/api/v1/points/history")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.availablePoints").value(0))
                .andExpect(jsonPath("$.data.monthlyEarnedPoints").value(0))
                .andExpect(jsonPath("$.data.histories").isEmpty());
    }

    @Test
    void monthlyEarnedPointsUseCompletedDateInsteadOfCompletedAt() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 0L);
        Mission previousMonthMission = saveMission("지난달 미션", 300L);
        Mission currentMonthMission = saveMission("이번달 미션", 500L);
        YearMonth currentMonth = YearMonth.now(KST_ZONE_ID);

        MissionCompletion previousMonthCompletion = missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(
                        user,
                        previousMonthMission,
                        currentMonth.minusMonths(1).atEndOfMonth()
                )
        );
        MissionCompletion currentMonthCompletion = missionCompletionRepository.saveAndFlush(
                MissionCompletion.create(
                        user,
                        currentMonthMission,
                        currentMonth.atDay(1)
                )
        );
        setCompletedAt(
                previousMonthCompletion,
                currentMonth.atDay(1).atTime(12, 0)
        );
        setCompletedAt(
                currentMonthCompletion,
                currentMonth.minusMonths(1).atEndOfMonth().atTime(12, 0)
        );

        mockMvc.perform(get("/api/v1/points/history")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.monthlyEarnedPoints").value(500));
    }

    @Test
    void unauthenticatedRequestsReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/points/conversions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));

        mockMvc.perform(post("/api/v1/points/conversions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"points": 10000}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));

        mockMvc.perform(get("/api/v1/points/history"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void partnerRequestsReturnForbidden() throws Exception {
        String partnerToken = BEARER_PREFIX
                + jwtTokenProvider.createAccessToken(1L, Role.PARTNER);

        mockMvc.perform(get("/api/v1/points/conversions")
                        .header(HttpHeaders.AUTHORIZATION, partnerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));

        mockMvc.perform(post("/api/v1/points/conversions")
                        .header(HttpHeaders.AUTHORIZATION, partnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"points": 10000}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));

        mockMvc.perform(get("/api/v1/points/history")
                        .header(HttpHeaders.AUTHORIZATION, partnerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    @Test
    void concurrentConversionsCannotSpendSamePointsTwice() throws Exception {
        User user = saveUser("growup", "ABCDEFGH", 10_000L);
        PointConversionRequest request = new PointConversionRequest(10_000L);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);

        try {
            Future<ErrorCode> first = executor.submit(
                    () -> convertAfterStart(start, user.getId(), request)
            );
            Future<ErrorCode> second = executor.submit(
                    () -> convertAfterStart(start, user.getId(), request)
            );
            start.countDown();

            assertThat(new ErrorCode[]{first.get(), second.get()})
                    .containsExactlyInAnyOrder(null, ErrorCode.INSUFFICIENT_POINTS);
        } finally {
            executor.shutdownNow();
        }

        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updatedUser.getTotalCarbonG()).isEqualTo(230L);
        assertThat(updatedUser.getConvertibleCarbonG()).isZero();
        assertThat(updatedUser.getAvailablePoints()).isZero();
        assertThat(updatedUser.getTotalEarnedPoints()).isEqualTo(10_000L);
        assertThat(pointConversionRepository.count()).isEqualTo(1L);
    }

    private ErrorCode convertAfterStart(
            CountDownLatch start,
            Long userId,
            PointConversionRequest request
    ) throws InterruptedException {
        start.await();
        try {
            pointService.convert(userId, request);
            return null;
        } catch (BusinessException exception) {
            return exception.getErrorCode();
        }
    }

    private void expectValidationError(User user, long points) throws Exception {
        mockMvc.perform(post("/api/v1/points/conversions")
                        .header(HttpHeaders.AUTHORIZATION, userBearerToken(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "points": %d
                                }
                                """.formatted(points)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    private User saveUser(String loginId, String inviteCode, long points) {
        User user = User.create(
                loginId,
                "hashed-password",
                "새싹이",
                inviteCode,
                CharacterType.TREE_A
        );
        if (points > 0) {
            user.completeMission(230L, points, LocalDate.of(2026, 10, 5));
        }
        return userRepository.saveAndFlush(user);
    }

    private String userBearerToken(Long userId) {
        return BEARER_PREFIX + jwtTokenProvider.createAccessToken(userId, Role.USER);
    }

    private Mission saveMission(String name, long rewardPoints) {
        return missionRepository.saveAndFlush(Mission.create(
                name,
                name + " 설명",
                MissionCategory.REUSABLE,
                100L,
                rewardPoints,
                true
        ));
    }

    private void setCompletedAt(MissionCompletion completion, LocalDateTime completedAt) {
        jdbcTemplate.update(
                "update mission_completions set completed_at = ? where id = ?",
                completedAt,
                completion.getId()
        );
    }

    private void cleanDatabase() {
        missionCompletionRepository.deleteAll();
        pointConversionRepository.deleteAll();
        partnerRepository.deleteAll();
        missionRepository.deleteAll();
        userRepository.deleteAll();
    }
}
