package com.code.codenest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "expiration_logs")
public class ExpirationLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "snip_id")
    private Long snipId;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt = LocalDateTime.now();

    @Column(name = "expiration_reason")
    private String expirationReason; // TIME, VIEWS, DELETED

    public ExpirationLog() {
    }

    public Long getId() {
        return id;
    }

    public Long getSnipId() {
        return snipId;
    }

    public void setSnipId(Long snipId) {
        this.snipId = snipId;
    }

    public LocalDateTime getExpiredAt() {
        return expiredAt;
    }

    public void setExpiredAt(LocalDateTime expiredAt) {
        this.expiredAt = expiredAt;
    }

    public String getExpirationReason() {
        return expirationReason;
    }

    public void setExpirationReason(String expirationReason) {
        this.expirationReason = expirationReason;
    }
}