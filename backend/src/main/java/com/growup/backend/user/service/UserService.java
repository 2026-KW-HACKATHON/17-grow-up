package com.growup.backend.user.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.global.security.JwtTokenProvider;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.dto.ChangePasswordRequest;
import com.growup.backend.user.dto.QrTokenResponse;
import com.growup.backend.user.dto.UpdateNicknameRequest;
import com.growup.backend.user.dto.UpdateNicknameResponse;
import com.growup.backend.user.dto.UserMeResponse;
import com.growup.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

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

    @Transactional
    public void changePassword(Long accountId, ChangePasswordRequest request) {
        User user = findUserForUpdate(accountId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.CURRENT_PASSWORD_MISMATCH);
        }
        if (!request.newPassword().equals(request.newPasswordConfirm())) {
            throw new BusinessException(ErrorCode.PASSWORD_CONFIRM_MISMATCH);
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.SAME_AS_OLD_PASSWORD);
        }

        user.changePassword(passwordEncoder.encode(request.newPassword()));
    }

    private User findUserForUpdate(Long accountId) {
        return userRepository.findByIdForUpdate(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private User findUser(Long accountId) {
        return userRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
