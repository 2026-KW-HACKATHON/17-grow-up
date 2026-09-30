package com.growup.backend.global.exception;

public record ErrorResponse(boolean success, ErrorDetail error) {

    public static ErrorResponse from(ErrorCode errorCode) {
        return of(errorCode.name(), errorCode.getMessage());
    }

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(false, new ErrorDetail(code, message));
    }

    public record ErrorDetail(String code, String message) {
    }
}
