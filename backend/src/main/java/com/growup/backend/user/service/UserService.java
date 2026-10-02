package com.growup.backend.user.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.dto.QrTokenResponse;
import com.growup.backend.user.dto.UpdateNicknameRequest;
import com.growup.backend.user.dto.UpdateNicknameResponse;
import com.growup.backend.user.dto.UserMeResponse;
import com.growup.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public UserMeResponse getMyInfo(Long accountId) {
        return UserMeResponse.from(findUser(accountId));
    }

    public QrTokenResponse issueQrToken(Long accountId) {
        User user = findUser(accountId);
        return new QrTokenResponse(jwtTokenProvider.createQrToken(user.getId()));
    }

    @Transactional
    public UpdateNicknameResponse updateNickname(Long accountId, UpdateNicknameRequest request) {
        User user = findUser(accountId);
        user.changeNickname(request.nickname());
        return UpdateNicknameResponse.from(user);
    }

    private User findUser(Long accountId) {
        return userRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
