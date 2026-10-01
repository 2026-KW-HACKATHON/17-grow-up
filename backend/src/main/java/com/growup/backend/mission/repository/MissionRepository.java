package com.growup.backend.mission.repository;

import com.growup.backend.mission.domain.Mission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MissionRepository extends JpaRepository<Mission, Long> {

    List<Mission> findAllByActiveTrueOrderByIdAsc();

    Optional<Mission> findByIdAndActiveTrue(Long id);
}
