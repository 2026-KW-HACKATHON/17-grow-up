package com.growup.backend.partner.dto;

import java.util.List;

public record PartnerListResponse(
        List<PartnerResponse> partners
) {
}