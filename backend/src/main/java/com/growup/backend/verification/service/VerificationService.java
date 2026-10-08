package com.growup.backend.verification.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.domain.MissionCompletion;
import com.growup.backend.mission.repository.MissionCompletionRepository;
import com.growup.backend.mission.repository.MissionRepository;
import com.growup.backend.partner.domain.PartnerAccount;
import com.growup.backend.partner.repository.PartnerAccountRepository;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import com.growup.backend.verification.dto.VerificationRequest;
import com.growup.backend.verification.dto.VerificationResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");
    private static final String COMPLETION_UNIQUE_CONSTRAINT =
            "uk_mission_completion_user_mission_date";
    private static final Pattern COMPLETION_CONSTRAINT_PATTERN = Pattern.compile(
            "(^|[^a-z0-9_])"
                    + Pattern.quote(COMPLETION_UNIQUE_CONSTRAINT)
                    + "([^a-z0-9_]|$)"
    );

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final MissionRepository missionRepository;
    private final MissionCompletionRepository missionCompletionRepository;
    private final PartnerAccountRepository partnerAccountRepository;

    @Transactional
    public VerificationResponse verify(
            Long authenticatedPartnerAccountId,
            VerificationRequest request
    ) {
        Objects.requireNonNull(
                authenticatedPartnerAccountId,
                "인증된 제휴처 계정 ID는 필수입니다."
        );

        Long userId = extractQrUserId(request.qrToken());
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Mission mission = missionRepository.findByIdAndActiveTrue(request.missionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MISSION_NOT_FOUND));
        PartnerAccount partnerAccount = partnerAccountRepository
                .findById(authenticatedPartnerAccountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTNER_NOT_FOUND));
        LocalDate today = LocalDate.now(KST_ZONE_ID);

        if (missionCompletionRepository.existsByUserIdAndMissionIdAndCompletedDate(
                user.getId(),
                mission.getId(),
                today
        )) {
            throw new BusinessException(ErrorCode.MISSION_ALREADY_COMPLETED);
        }

        MissionCompletion completion = MissionCompletion.create(
                user,
                mission,
                partnerAccount.getPartner(),
                today
        );
        try {
            MissionCompletion savedCompletion = missionCompletionRepository.saveAndFlush(
                    completion
            );
            user.completeMission(
                    mission.getCarbonReductionG(),
                    mission.getRewardPoints(),
                    today
            );
            return VerificationResponse.from(savedCompletion);
        } catch (DataIntegrityViolationException exception) {
            if (isCompletionUniqueConstraintViolation(exception)) {
                throw new BusinessException(ErrorCode.MISSION_ALREADY_COMPLETED);
            }
            throw exception;
        }
    }

    private Long extractQrUserId(String qrToken) {
        try {
            return jwtTokenProvider.getQrAccountId(qrToken);
        } catch (ExpiredJwtException exception) {
            throw new BusinessException(ErrorCode.EXPIRED_QR_TOKEN);
        } catch (JwtException | IllegalArgumentException exception) {
            throw new BusinessException(ErrorCode.INVALID_QR_TOKEN);
        }
    }

    private boolean isCompletionUniqueConstraintViolation(
            DataIntegrityViolationException exception
    ) {
        Throwable cause = exception;
        while (cause != null) {
            if (cause instanceof ConstraintViolationException constraintViolationException) {
                return isCompletionConstraintName(
                        constraintViolationException.getConstraintName()
                );
            }
            cause = cause.getCause();
        }
        return false;
    }

    private boolean isCompletionConstraintName(String constraintName) {
        if (constraintName == null) {
            return false;
        }
        String normalizedName = constraintName
                .replace("`", "")
                .replace("\"", "")
                .toLowerCase(Locale.ROOT);
        return COMPLETION_CONSTRAINT_PATTERN.matcher(normalizedName).find();
    }
}
