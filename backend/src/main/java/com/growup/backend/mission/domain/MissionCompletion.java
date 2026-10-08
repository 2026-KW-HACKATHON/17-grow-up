package com.growup.backend.mission.domain;

import com.growup.backend.partner.domain.Partner;
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
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "mission_completions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_mission_completion_user_mission_date",
                columnNames = {"user_id", "mission_id", "completed_date"}
        )
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MissionCompletion {

    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private Partner partner;

    @Column(name = "completed_date", nullable = false)
    private LocalDate completedDate;

    @Column(name = "completed_at", nullable = false, updatable = false)
    private LocalDateTime completedAt;

    public static MissionCompletion create(
            User user,
            Mission mission,
            LocalDate completedDate
    ) {
        return create(user, mission, null, completedDate);
    }

    public static MissionCompletion create(
            User user,
            Mission mission,
            Partner partner,
            LocalDate completedDate
    ) {
        MissionCompletion completion = new MissionCompletion();
        completion.user = Objects.requireNonNull(user, "user는 필수입니다.");
        completion.mission = Objects.requireNonNull(mission, "mission은 필수입니다.");
        completion.partner = partner;
        completion.completedDate = Objects.requireNonNull(
                completedDate,
                "completedDate는 필수입니다."
        );
        return completion;
    }

    @PrePersist
    private void prePersist() {
        completedAt = LocalDateTime.now(KST_ZONE_ID);
    }
}
