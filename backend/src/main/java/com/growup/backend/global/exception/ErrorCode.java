package com.growup.backend.global.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    INVALID_LOGIN(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."),
    DUPLICATE_LOGIN_ID(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    INVALID_NICKNAME(HttpStatus.BAD_REQUEST, "올바르지 않은 닉네임입니다."),

    MISSION_NOT_FOUND(HttpStatus.NOT_FOUND, "미션을 찾을 수 없습니다."),
    MISSION_ALREADY_COMPLETED(HttpStatus.CONFLICT, "오늘 이미 완료한 미션입니다."),

    INVALID_QR_TOKEN(HttpStatus.BAD_REQUEST, "유효하지 않은 QR 코드입니다."),
    EXPIRED_QR_TOKEN(HttpStatus.BAD_REQUEST, "QR 토큰이 만료되었습니다."),
    MISSION_NOT_ALLOWED(HttpStatus.FORBIDDEN, "해당 제휴처에서 인증할 수 없는 미션입니다."),

    INSUFFICIENT_CARBON(HttpStatus.CONFLICT, "포인트로 전환할 수 있는 탄소 감축량이 부족합니다."),

    INVALID_PARTNER_LOGIN(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."),
    INACTIVE_PARTNER_ACCOUNT(HttpStatus.FORBIDDEN, "사용할 수 없는 제휴처 계정입니다.");

    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getMessage() {
        return message;
    }
}
