package com.growup.backend.partner.service;

import com.growup.backend.global.exception.BusinessException;
import com.growup.backend.global.exception.ErrorCode;
import com.growup.backend.partner.domain.PartnerAccount;
import com.growup.backend.partner.dto.PartnerListResponse;
import com.growup.backend.partner.dto.PartnerMeResponse;
import com.growup.backend.partner.dto.PartnerResponse;
import com.growup.backend.partner.repository.PartnerAccountRepository;
import com.growup.backend.partner.repository.PartnerRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnerService {

    private final PartnerRepository partnerRepository;
    private final PartnerAccountRepository partnerAccountRepository;

    public PartnerListResponse getPartners() {
        List<PartnerResponse> partners = partnerRepository.findAll()
                .stream()
                .map(PartnerResponse::from)
                .toList();

        return new PartnerListResponse(partners);
    }

    public PartnerMeResponse getMyPartner(Long accountId) {
        PartnerAccount account = partnerAccountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PARTNER_NOT_FOUND));

        return PartnerMeResponse.from(account);
    }
}