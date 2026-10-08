package com.growup.backend.partner.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.growup.backend.mission.domain.Mission;
import com.growup.backend.mission.domain.MissionCategory;
import com.growup.backend.mission.repository.MissionRepository;
import com.growup.backend.partner.domain.Partner;
import com.growup.backend.partner.domain.PartnerMission;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

@SpringBootTest
class PartnerMissionRepositoryIntegrationTest {

    @Autowired
    private PartnerMissionRepository partnerMissionRepository;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private MissionRepository missionRepository;

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    @Test
    void savesAndFindsPartnerMissionMapping() {
        Partner partner = savePartner();
        Mission mission = saveMission();

        PartnerMission mapping = partnerMissionRepository.saveAndFlush(
                PartnerMission.create(partner, mission)
        );

        assertThat(mapping.getId()).isNotNull();
        assertThat(partnerMissionRepository.existsByPartnerIdAndMissionId(
                partner.getId(),
                mission.getId()
        )).isTrue();
    }

    @Test
    void rejectsDuplicatePartnerAndMissionMapping() {
        Partner partner = savePartner();
        Mission mission = saveMission();
        partnerMissionRepository.saveAndFlush(PartnerMission.create(partner, mission));

        assertThatThrownBy(() -> partnerMissionRepository.saveAndFlush(
                PartnerMission.create(partner, mission)
        )).isInstanceOf(DataIntegrityViolationException.class);
    }

    private Partner savePartner() {
        return partnerRepository.saveAndFlush(Partner.create("그루업 테스트 카페"));
    }

    private Mission saveMission() {
        return missionRepository.saveAndFlush(Mission.create(
                "텀블러 사용하기",
                "일회용 컵 대신 텀블러를 사용합니다.",
                MissionCategory.REUSABLE,
                230L,
                500L,
                true
        ));
    }

    private void cleanDatabase() {
        partnerMissionRepository.deleteAll();
        partnerRepository.deleteAll();
        missionRepository.deleteAll();
    }
}
