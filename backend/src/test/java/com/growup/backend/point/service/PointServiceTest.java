package com.growup.backend.point.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.point.domain.PointConversion;
import com.growup.backend.point.dto.PointConversionRequest;
import com.growup.backend.point.dto.PointConversionResponse;
import com.growup.backend.point.repository.PointConversionRepository;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PointServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PointConversionRepository pointConversionRepository;

    @InjectMocks
    private PointService pointService;

    @Test
    void conversionUsesLockedUserAndSavesHistory() {
        User user = createUserWithPoints(20_000L);
        PointConversionRequest request = new PointConversionRequest(20_000L);
        when(userRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(user));
        when(pointConversionRepository.saveAndFlush(any(PointConversion.class)))
                .thenAnswer(invocation -> {
                    PointConversion conversion = invocation.getArgument(0);
                    ReflectionTestUtils.setField(conversion, "id", 5L);
                    ReflectionTestUtils.setField(
                            conversion,
                            "createdAt",
                            LocalDateTime.of(2026, 10, 5, 12, 0)
                    );
                    return conversion;
                });

        PointConversionResponse response = pointService.convert(1L, request);

        assertThat(response.conversionId()).isEqualTo(5L);
        assertThat(response.convertedPoints()).isEqualTo(20_000L);
        assertThat(response.seoulPayAmount()).isEqualTo(200L);
        assertThat(response.remainingPoints()).isZero();
        assertThat(user.getTotalCarbonG()).isEqualTo(230L);
        assertThat(user.getAvailablePoints()).isZero();
        assertThat(user.getTotalEarnedPoints()).isEqualTo(20_000L);
        verify(userRepository).findByIdForUpdate(1L);
    }

    @Test
    void insufficientPointsDoNotChangeUserOrSaveHistory() {
        User user = createUserWithPoints(10_000L);
        PointConversionRequest request = new PointConversionRequest(20_000L);
        when(userRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> pointService.convert(1L, request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INSUFFICIENT_POINTS);

        assertThat(user.getTotalCarbonG()).isEqualTo(230L);
        assertThat(user.getAvailablePoints()).isEqualTo(10_000L);
        assertThat(user.getTotalEarnedPoints()).isEqualTo(10_000L);
        verify(pointConversionRepository, never()).saveAndFlush(any());
    }

    private User createUserWithPoints(long points) {
        User user = User.create(
                "growup",
                "hashed-password",
                "새싹이",
                "ABCDEFGH",
                CharacterType.TREE_A
        );
        user.completeMission(230L, points, LocalDate.of(2026, 10, 5));
        return user;
    }
}
