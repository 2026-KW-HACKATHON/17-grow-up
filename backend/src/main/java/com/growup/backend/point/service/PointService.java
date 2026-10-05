package com.growup.backend.point.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.point.domain.PointConversion;
import com.growup.backend.point.dto.PointConversionListResponse;
import com.growup.backend.point.dto.PointConversionHistoryResponse;
import com.growup.backend.point.dto.PointConversionRequest;
import com.growup.backend.point.dto.PointConversionResponse;
import com.growup.backend.point.repository.PointConversionRepository;
import com.growup.backend.user.domain.User;
import com.growup.backend.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PointService {

    private static final long POINT_UNIT = 10_000L;
    private static final long SEOUL_PAY_PER_UNIT = 100L;

    private final UserRepository userRepository;
    private final PointConversionRepository pointConversionRepository;

    @Transactional
    public PointConversionResponse convert(Long userId, PointConversionRequest request) {
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        long points = request.points();

        if (user.getAvailablePoints() < points) {
            throw new BusinessException(ErrorCode.INSUFFICIENT_POINTS);
        }

        long seoulPayAmount = points / POINT_UNIT * SEOUL_PAY_PER_UNIT;
        user.convertPointsToSeoulPay(points);

        PointConversion conversion = PointConversion.create(
                user,
                points,
                seoulPayAmount
        );
        return PointConversionResponse.from(
                pointConversionRepository.saveAndFlush(conversion),
                user.getAvailablePoints()
        );
    }

    public PointConversionListResponse getConversions(Long userId) {
        List<PointConversionHistoryResponse> conversions = pointConversionRepository
                .findAllByUserIdOrderByCreatedAtDescIdDesc(userId)
                .stream()
                .map(PointConversionHistoryResponse::from)
                .toList();

        return new PointConversionListResponse(conversions);
    }
}
