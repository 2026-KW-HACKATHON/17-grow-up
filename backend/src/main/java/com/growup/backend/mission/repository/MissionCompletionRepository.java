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

    List<MissionCompletion> findAllByUserIdAndCompletedDateBetweenOrderByCompletedDateAsc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("""
            select completion
            from MissionCompletion completion
            join fetch completion.mission
            left join fetch completion.partner
            where completion.user.id = :userId
            order by completion.completedAt desc, completion.id desc
            """)
    List<MissionCompletion> findPointHistoryByUserId(@Param("userId") Long userId);

    @Query("""
            select coalesce(sum(completion.mission.rewardPoints), 0)
            from MissionCompletion completion
            where completion.user.id = :userId
              and completion.completedDate between :startDate and :endDate
            """)
    long sumRewardPointsByUserIdAndCompletedDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            select completion.mission.id as missionId,
                   completion.mission.name as missionName,
                   count(completion.id) as completionCount
            from MissionCompletion completion
            where completion.user.id = :userId
            group by completion.mission.id, completion.mission.name
            order by completion.mission.id asc
            """)
    List<MissionCompletionStatProjection> findMissionStatsByUserId(
            @Param("userId") Long userId
    );
}
