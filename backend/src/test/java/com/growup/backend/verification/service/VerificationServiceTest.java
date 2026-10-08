package com.growup.backend.verification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.domain.MissionCategory;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.mission.repository.MissionRepository;
import com.growup.backend.partner.domain.Partner;
import com.growup.backend.partner.domain.PartnerAccount;
import com.growup.backend.partner.repository.PartnerAccountRepository;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import com.growup.backend.verification.dto.VerificationRequest;
import java.util.Optional;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

@ExtendWith(MockitoExtension.class)
class VerificationServiceTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private MissionCompletionRepository missionCompletionRepository;

    @Mock
    private PartnerAccountRepository partnerAccountRepository;

    @InjectMocks
    private VerificationService verificationService;

    private User user;
    private Mission mission;
    private PartnerAccount partnerAccount;
    private VerificationRequest request;

    @BeforeEach
    void setUp() {
        user = User.create(
                "growup",
                "hashed-password",
                "새싹이",
                "ABCDEFGH",
                CharacterType.TREE_A
        );
        mission = Mission.create(
                "텀블러 사용",
                "일회용 컵 대신 텀블러를 사용합니다.",
                MissionCategory.REUSABLE,
                230L,
                500L,
                true
        );
        Partner partner = Partner.create("그루업 테스트 카페");
        partnerAccount = PartnerAccount.create(
                "partner",
                "hashed-password",
                true,
                partner
        );
        request = new VerificationRequest("qr-token", 1L);
    }

    @Test
    void mapsCompletionUniqueConstraintViolationToAlreadyCompleted() {
        DataIntegrityViolationException databaseException = databaseExceptionWithConstraint(
                "PUBLIC.uk_mission_completion_user_mission_date"
        );
        prepareSuccessfulLookup();
        when(missionCompletionRepository.saveAndFlush(any())).thenThrow(databaseException);

        assertThatThrownBy(() -> verificationService.verify(10L, request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.MISSION_ALREADY_COMPLETED);
        assertThat(user.getTotalCarbonG()).isZero();
        assertThat(user.getConvertibleCarbonG()).isZero();
        assertThat(user.getAvailablePoints()).isZero();
        assertThat(user.getTotalEarnedPoints()).isZero();
        assertThat(user.getCurrentStreak()).isZero();
    }

    @Test
    void doesNotConvertUnrelatedDataIntegrityViolation() {
        DataIntegrityViolationException databaseException = databaseExceptionWithConstraint(
                "uk_unrelated_constraint"
        );
        prepareSuccessfulLookup();
        when(missionCompletionRepository.saveAndFlush(any())).thenThrow(databaseException);

        assertThatThrownBy(() -> verificationService.verify(10L, request))
                .isSameAs(databaseException);
    }

    private void prepareSuccessfulLookup() {
        when(jwtTokenProvider.getQrAccountId(request.qrToken())).thenReturn(1L);
        when(userRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(user));
        when(missionRepository.findByIdAndActiveTrue(request.missionId()))
                .thenReturn(Optional.of(mission));
        when(partnerAccountRepository.findById(10L)).thenReturn(Optional.of(partnerAccount));
        when(missionCompletionRepository.existsByUserIdAndMissionIdAndCompletedDate(
                any(),
                any(),
                any()
        )).thenReturn(false);
    }

    private DataIntegrityViolationException databaseExceptionWithConstraint(
            String constraintName
    ) {
        ConstraintViolationException constraintViolation = mock(ConstraintViolationException.class);
        when(constraintViolation.getConstraintName()).thenReturn(constraintName);
        return new DataIntegrityViolationException("constraint violation", constraintViolation);
    }
}
