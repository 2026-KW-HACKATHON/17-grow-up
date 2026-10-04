package com.growup.backend.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_login_id", columnNames = "login_id"),
                @UniqueConstraint(name = "uk_users_invite_code", columnNames = "invite_code")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", nullable = false, length = 50)
    private String loginId;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, length = 30)
    private String nickname;

    @Column(name = "invite_code", nullable = false, length = 12)
    private String inviteCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "character_type", nullable = false, length = 20)
    private CharacterType characterType;

    @Column(name = "total_carbon_g", nullable = false)
    private long totalCarbonG;

    @Column(name = "convertible_carbon_g", nullable = false)
    private long convertibleCarbonG;

    @Column(name = "available_points", nullable = false)
    private long availablePoints;

    @Column(name = "total_earned_points", nullable = false)
    private long totalEarnedPoints;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak;

    @Column(name = "longest_streak", nullable = false)
    private int longestStreak;

    @Column(name = "last_practice_date")
    private LocalDate lastPracticeDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static User create(
            String loginId,
            String passwordHash,
            String nickname,
            String inviteCode,
            CharacterType characterType
    ) {
        User user = new User();
        user.loginId = loginId;
        user.passwordHash = passwordHash;
        user.nickname = nickname;
        user.inviteCode = inviteCode;
        user.characterType = characterType;
        user.totalCarbonG = 0L;
        user.convertibleCarbonG = 0L;
        user.availablePoints = 0L;
        user.totalEarnedPoints = 0L;
        user.currentStreak = 0;
        user.longestStreak = 0;
        user.lastPracticeDate = null;
        return user;
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void completeMission(long carbonReductionG, LocalDate completedDate) {
        LocalDate completionDate = Objects.requireNonNull(
                completedDate,
                "completedDate는 필수입니다."
        );
        if (carbonReductionG < 0) {
            throw new IllegalArgumentException("carbonReductionG는 0 이상이어야 합니다.");
        }

        totalCarbonG += carbonReductionG;
        convertibleCarbonG += carbonReductionG;

        if (lastPracticeDate == null) {
            currentStreak = 1;
        } else if (completionDate.equals(lastPracticeDate.plusDays(1))) {
            currentStreak++;
        } else if (completionDate.isAfter(lastPracticeDate)) {
            currentStreak = 1;
        }

        longestStreak = Math.max(longestStreak, currentStreak);
        if (lastPracticeDate == null || completionDate.isAfter(lastPracticeDate)) {
            lastPracticeDate = completionDate;
        }
    }

    @PrePersist
    private void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    private void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
