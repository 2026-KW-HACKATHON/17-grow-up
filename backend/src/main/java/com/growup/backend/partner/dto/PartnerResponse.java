package com.growup.backend.partner.dto;

import com.growup.backend.partner.domain.Partner;

public record PartnerResponse(
        Long partnerId,
        String partnerName
) {

    public static PartnerResponse from(Partner partner) {
        return new PartnerResponse(
                partner.getId(),
                partner.getName()
        );
    }
}