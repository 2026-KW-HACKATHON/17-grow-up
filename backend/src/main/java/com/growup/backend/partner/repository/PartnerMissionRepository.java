package com.growup.backend.partner.repository;

import com.growup.backend.partner.domain.PartnerMission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerMissionRepository extends JpaRepository<PartnerMission, Long> {

    boolean existsByPartnerIdAndMissionId(Long partnerId, Long missionId);
}
