package com.growup.backend.partner.domain;

import com.growup.backend.mission.domain.Mission;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "partner_missions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_partner_missions_partner_mission",
                columnNames = {"partner_id", "mission_id"}
        )
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PartnerMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    public static PartnerMission create(Partner partner, Mission mission) {
        PartnerMission partnerMission = new PartnerMission();
        partnerMission.partner = Objects.requireNonNull(partner, "partner는 필수입니다.");
        partnerMission.mission = Objects.requireNonNull(mission, "mission은 필수입니다.");
        return partnerMission;
    }
}
