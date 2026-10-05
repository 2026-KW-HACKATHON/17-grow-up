package com.growup.backend.partner.service;

import com.growup.backend.auth.dto.AccessTokenResponse;
import com.growup.backend.auth.dto.LoginRequest;
import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.global.security.Role;
import com.growup.backend.partner.domain.PartnerAccount;
import com.growup.backend.partner.repository.PartnerAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnerAuthService {

    private final PartnerAccountRepository partnerAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AccessTokenResponse login(LoginRequest request) {
        PartnerAccount account = partnerAccountRepository.findByLoginId(request.loginId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_PARTNER_LOGIN));

        if (!passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_PARTNER_LOGIN);
        }
        if (!account.isActive()) {
            throw new BusinessException(ErrorCode.INACTIVE_PARTNER_ACCOUNT);
        }

        String accessToken = jwtTokenProvider.createAccessToken(account.getId(), Role.PARTNER);
        return AccessTokenResponse.bearer(
                accessToken,
                jwtTokenProvider.getAccessTokenExpirationSeconds()
        );
    }
}
