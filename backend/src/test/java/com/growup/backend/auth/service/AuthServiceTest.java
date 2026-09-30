package com.growup.backend.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    void signupStoresHashedPasswordAndInitializesUserWithoutIssuingToken() {
        SignupRequest request = new SignupRequest("growup", "password123", "새싹이");
        when(userRepository.existsByLoginId(request.loginId())).thenReturn(false);
        when(userRepository.existsByInviteCode(any())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            ReflectionTestUtils.setField(user, "id", 1L);
            return user;
        });

        SignupResponse response = authService.signup(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.loginId()).isEqualTo("growup");
        assertThat(response.nickname()).isEqualTo("새싹이");
        assertThat(response.characterType()).isNotNull();
        assertThat(savedUser.getPasswordHash()).isEqualTo("hashed-password");
        assertThat(savedUser.getInviteCode()).hasSize(8);
        assertThat(savedUser.getTotalCarbonG()).isZero();
        assertThat(savedUser.getConvertibleCarbonG()).isZero();
        assertThat(savedUser.getAvailablePoints()).isZero();
        assertThat(savedUser.getTotalEarnedPoints()).isZero();
        assertThat(savedUser.getCurrentStreak()).isZero();
        assertThat(savedUser.getLongestStreak()).isZero();
        assertThat(savedUser.getLastPracticeDate()).isNull();
        verify(jwtTokenProvider, never()).createAccessToken(any(), any());
    }

    @Test
    void signupRejectsDuplicateLoginId() {
        SignupRequest request = new SignupRequest("growup", "password123", "새싹이");
        when(userRepository.existsByLoginId(request.loginId())).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.DUPLICATE_LOGIN_ID);

        verify(userRepository, never()).save(any());
    }

    @Test
    void loginIssuesUserAccessTokenWhenPasswordMatches() {
        User user = User.create(
                "growup",
                "hashed-password",
                "새싹이",
                "ABCDEFGH",
                CharacterType.TREE_A
        );
        ReflectionTestUtils.setField(user, "id", 7L);
        LoginRequest request = new LoginRequest("growup", "password123");

        when(userRepository.findByLoginId(request.loginId())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.createAccessToken(7L, Role.USER)).thenReturn("access-token");
        when(jwtTokenProvider.getAccessTokenExpirationSeconds()).thenReturn(3600L);

        AccessTokenResponse response = authService.login(request);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresIn()).isEqualTo(3600L);
    }

    @Test
    void loginUsesSameErrorForUnknownIdAndWrongPassword() {
        LoginRequest request = new LoginRequest("unknown", "password123");
        when(userRepository.findByLoginId(request.loginId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_LOGIN);
    }
}
