package com.growup.backend.user.dto;

import com.growup.backend.global.validation.Utf8ByteLength;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "현재 비밀번호는 필수입니다.")
        @Size(max = 72, message = "현재 비밀번호는 72자 이하여야 합니다.")
        String currentPassword,

        @NotBlank(message = "새 비밀번호는 필수입니다.")
        @Size(min = 8, max = 72, message = "새 비밀번호는 8자 이상 72자 이하여야 합니다.")
        @Utf8ByteLength(max = 72, message = "새 비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.")
        String newPassword,

        @NotBlank(message = "새 비밀번호 확인은 필수입니다.")
        @Size(min = 8, max = 72, message = "새 비밀번호 확인은 8자 이상 72자 이하여야 합니다.")
        @Utf8ByteLength(
                max = 72,
                message = "새 비밀번호 확인은 UTF-8 기준 72바이트 이하여야 합니다."
        )
        String newPasswordConfirm
) {
}
