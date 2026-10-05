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
import com.growup.backend.point.domain.PointConversion;
import com.growup.backend.point.dto.PointConversionRequest;
import com.growup.backend.point.repository.PointConversionRepository;
import com.growup.backend.point.service.PointService;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.time.LocalDate;
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
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PointApiIntegrationTest {

    private static final String BEARER_PREFIX = "Bearer ";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PointConversionRepository pointConversionRepository;

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

    private void cleanDatabase() {
        pointConversionRepository.deleteAll();
        userRepository.deleteAll();
    }
}
