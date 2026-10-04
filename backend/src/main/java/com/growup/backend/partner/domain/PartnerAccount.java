package com.growup.backend.partner.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(
        name = "partner_accounts",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_partner_accounts_login_id",
                columnNames = "login_id"
        )
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PartnerAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", nullable = false, length = 50)
    private String loginId;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false)
    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static PartnerAccount create(
            String loginId,
            String passwordHash,
            boolean active,
            Partner partner
    ) {
        PartnerAccount account = new PartnerAccount();
        account.loginId = Objects.requireNonNull(loginId, "loginId는 필수입니다.");
        account.passwordHash = Objects.requireNonNull(
                passwordHash,
                "passwordHash는 필수입니다."
        );
        account.active = active;
        account.partner = Objects.requireNonNull(partner, "partner는 필수입니다.");
        return account;
    }

    @PrePersist
    private void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    private void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
