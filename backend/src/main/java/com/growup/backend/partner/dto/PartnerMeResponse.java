package com.growup.backend.partner.dto;

import com.growup.backend.partner.domain.Partner;
import com.growup.backend.partner.domain.PartnerAccount;

public record PartnerMeResponse(
        EmployeeInfo employee,
        PartnerInfo partner
) {

    public static PartnerMeResponse from(PartnerAccount account) {
        Partner partner = account.getPartner();

        return new PartnerMeResponse(
                new EmployeeInfo(
                        account.getId(),
                        account.getLoginId()
                ),
                new PartnerInfo(
                        partner.getId(),
                        partner.getName()
                )
        );
    }

    public record EmployeeInfo(
            Long employeeId,
            String loginId
    ) {
    }

    public record PartnerInfo(
            Long partnerId,
            String partnerName
    ) {
    }
}