package com.growup.backend.point.domain;

import com.growup.backend.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "point_conversions")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PointConversion {

    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "converted_points", nullable = false)
    private long convertedPoints;

    @Column(name = "seoul_pay_amount", nullable = false)
    private long seoulPayAmount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static PointConversion create(
            User user,
            long convertedPoints,
            long seoulPayAmount
    ) {
        if (convertedPoints <= 0 || seoulPayAmount <= 0) {
            throw new IllegalArgumentException("전환 포인트와 서울페이 금액은 양수여야 합니다.");
        }

        PointConversion conversion = new PointConversion();
        conversion.user = Objects.requireNonNull(user, "user는 필수입니다.");
        conversion.convertedPoints = convertedPoints;
        conversion.seoulPayAmount = seoulPayAmount;
        return conversion;
    }

    @PrePersist
    private void prePersist() {
        createdAt = LocalDateTime.now(KST_ZONE_ID);
    }
}
