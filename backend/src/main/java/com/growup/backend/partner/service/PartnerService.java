package com.growup.backend.partner.service;

import com.growup.backend.partner.dto.PartnerListResponse;
import com.growup.backend.partner.dto.PartnerResponse;
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

    public PartnerListResponse getPartners() {
        List<PartnerResponse> partners = partnerRepository.findAll()
                .stream()
                .map(PartnerResponse::from)
                .toList();

        return new PartnerListResponse(partners);
    }
}