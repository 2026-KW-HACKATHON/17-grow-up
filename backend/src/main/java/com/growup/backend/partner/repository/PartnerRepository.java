package com.growup.backend.partner.repository;

import com.growup.backend.partner.domain.Partner;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerRepository extends JpaRepository<Partner, Long> {
}