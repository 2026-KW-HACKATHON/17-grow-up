package com.growup.backend.mission.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "missions")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Mission {

    private static final ZoneId KST_ZONE_ID = ZoneId.of("Asia/Seoul");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 1_000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MissionCategory category;

    @Column(name = "carbon_reduction_g", nullable = false)
    private long carbonReductionG;

    @Column(name = "reward_points", nullable = false)
    private long rewardPoints;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static Mission create(
            String name,
            String description,
            MissionCategory category,
            long carbonReductionG,
            long rewardPoints,
            boolean active
    ) {
        Mission mission = new Mission();
        mission.name = name;
        mission.description = description;
        mission.category = category;
        mission.carbonReductionG = carbonReductionG;
        mission.rewardPoints = rewardPoints;
        mission.active = active;
        return mission;
    }

    @PrePersist
    private void prePersist() {
        createdAt = LocalDateTime.now(KST_ZONE_ID);
    }
}
