package com.growup.backend.auth.service;

import com.growup.backend.auth.dto.AccessTokenResponse;
import com.growup.backend.auth.dto.LoginRequest;
import com.growup.backend.auth.dto.SignupRequest;
import com.growup.backend.auth.dto.SignupResponse;
import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.global.security.Role;
import com.growup.backend.user.domain.CharacterType;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.security.SecureRandom;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private static final char[] INVITE_CODE_CHARACTERS =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int INVITE_CODE_LENGTH = 8;
    private static final String LOGIN_ID_UNIQUE_CONSTRAINT = "uk_users_login_id";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        if (userRepository.existsByLoginId(request.loginId())) {
            throw new BusinessException(ErrorCode.DUPLICATE_LOGIN_ID);
        }

        User user = User.create(
                request.loginId(),
                passwordEncoder.encode(request.password()),
                request.nickname(),
                generateUniqueInviteCode(),
                CharacterType.random()
        );

        try {
            return SignupResponse.from(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException exception) {
            if (isLoginIdConstraintViolation(exception)) {
                throw new BusinessException(ErrorCode.DUPLICATE_LOGIN_ID);
            }
            throw exception;
        }
    }

    public AccessTokenResponse login(LoginRequest request) {
        User user = userRepository.findByLoginId(request.loginId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_LOGIN));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_LOGIN);
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), Role.USER);
        return AccessTokenResponse.bearer(
                accessToken,
                jwtTokenProvider.getAccessTokenExpirationSeconds()
        );
    }

    private String generateUniqueInviteCode() {
        String inviteCode;
        do {
            inviteCode = generateInviteCode();
        } while (userRepository.existsByInviteCode(inviteCode));
        return inviteCode;
    }

    private String generateInviteCode() {
        StringBuilder builder = new StringBuilder(INVITE_CODE_LENGTH);
        for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
            builder.append(
                    INVITE_CODE_CHARACTERS[SECURE_RANDOM.nextInt(INVITE_CODE_CHARACTERS.length)]
            );
        }
        return builder.toString();
    }

    private boolean isLoginIdConstraintViolation(DataIntegrityViolationException exception) {
        Throwable cause = exception;
        while (cause != null) {
            if (cause instanceof ConstraintViolationException constraintViolationException) {
                return isLoginIdConstraintName(constraintViolationException.getConstraintName());
            }
            cause = cause.getCause();
        }
        return false;
    }

    private boolean isLoginIdConstraintName(String constraintName) {
        if (constraintName == null) {
            return false;
        }

        String normalizedName = constraintName
                .replace("`", "")
                .replace("\"", "")
                .toLowerCase(Locale.ROOT);

        return normalizedName.equals(LOGIN_ID_UNIQUE_CONSTRAINT)
                || normalizedName.endsWith("." + LOGIN_ID_UNIQUE_CONSTRAINT);
    }
}
