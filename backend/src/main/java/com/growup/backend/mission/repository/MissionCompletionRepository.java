package com.growup.backend.mission.repository;

import com.growup.backend.mission.domain.MissionCompletion;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MissionCompletionRepository extends JpaRepository<MissionCompletion, Long> {

    boolean existsByUserIdAndMissionIdAndCompletedDate(
            Long userId,
            Long missionId,
            LocalDate completedDate
    );

    @Query("""
            select completion.mission.id
            from MissionCompletion completion
            where completion.user.id = :userId
              and completion.completedDate = :completedDate
            """)
    List<Long> findCompletedMissionIdsByUserIdAndCompletedDate(
            @Param("userId") Long userId,
            @Param("completedDate") LocalDate completedDate
    );

    long countByUserId(Long userId);

    List<MissionCompletion> findAllByUserIdOrderByCompletedAtDesc(Long userId);
}