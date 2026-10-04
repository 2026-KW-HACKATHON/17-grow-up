package com.growup.backend.partner.repository;

import com.growup.backend.partner.domain.PartnerAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerAccountRepository extends JpaRepository<PartnerAccount, Long> {

    Optional<PartnerAccount> findByLoginId(String loginId);
}
