package com.growup.backend.partner.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.growup.backend.auth.dto.AccessTokenResponse;
import com.growup.backend.auth.dto.LoginRequest;
import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.global.security.Role;
import com.growup.backend.partner.domain.Partner;
import com.growup.backend.partner.domain.PartnerAccount;
import com.growup.backend.partner.repository.PartnerAccountRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PartnerAuthServiceTest {

    @Mock
    private PartnerAccountRepository partnerAccountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private PartnerAuthService partnerAuthService;

    @Test
    void loginIssuesPartnerAccessTokenWhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest("cafe01", "password123!");
        PartnerAccount account = createAccount(true);

        when(partnerAccountRepository.findByLoginId(request.loginId()))
                .thenReturn(Optional.of(account));
        when(passwordEncoder.matches(request.password(), account.getPasswordHash()))
                .thenReturn(true);
        when(jwtTokenProvider.createAccessToken(10L, Role.PARTNER))
                .thenReturn("access-token");
        when(jwtTokenProvider.getAccessTokenExpirationSeconds()).thenReturn(3600L);

        AccessTokenResponse response = partnerAuthService.login(request);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.expiresIn()).isEqualTo(3600L);
        verify(jwtTokenProvider).createAccessToken(10L, Role.PARTNER);
    }

    @Test
    void unknownLoginIdReturnsInvalidPartnerLogin() {
        LoginRequest request = new LoginRequest("unknown", "password123!");
        when(partnerAccountRepository.findByLoginId(request.loginId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> partnerAuthService.login(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_PARTNER_LOGIN);

        verify(jwtTokenProvider, never()).createAccessToken(10L, Role.PARTNER);
    }

    @Test
    void wrongPasswordReturnsInvalidPartnerLogin() {
        LoginRequest request = new LoginRequest("cafe01", "wrong-password");
        PartnerAccount account = createAccount(true);
        when(partnerAccountRepository.findByLoginId(request.loginId()))
                .thenReturn(Optional.of(account));
        when(passwordEncoder.matches(request.password(), account.getPasswordHash()))
                .thenReturn(false);

        assertThatThrownBy(() -> partnerAuthService.login(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_PARTNER_LOGIN);
    }

    @Test
    void inactiveAccountReturnsInactivePartnerAccountAfterPasswordMatches() {
        LoginRequest request = new LoginRequest("cafe01", "password123!");
        PartnerAccount account = createAccount(false);
        when(partnerAccountRepository.findByLoginId(request.loginId()))
                .thenReturn(Optional.of(account));
        when(passwordEncoder.matches(request.password(), account.getPasswordHash()))
                .thenReturn(true);

        assertThatThrownBy(() -> partnerAuthService.login(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INACTIVE_PARTNER_ACCOUNT);
    }

    private PartnerAccount createAccount(boolean active) {
        Partner partner = Partner.create("그루업 테스트 카페");
        PartnerAccount account = PartnerAccount.create(
                "cafe01",
                "hashed-password",
                active,
                partner
        );
        ReflectionTestUtils.setField(account, "id", 10L);
        return account;
    }
}
