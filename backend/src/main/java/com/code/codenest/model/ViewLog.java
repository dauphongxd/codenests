package com.code.codenest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "view_logs")
public class ViewLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "snip_id", nullable = false)
    private Snip snip;

    @Column(name = "viewer_id")
    private Long viewerId;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt = LocalDateTime.now();

    public ViewLog() {
    }

    public Long getId() {
        return id;
    }

    public Snip getSnip() {
        return snip;
    }

    public void setSnip(Snip snip) {
        this.snip = snip;
    }

    public Long getViewerId() {
        return viewerId;
    }

    public void setViewerId(Long viewerId) {
        this.viewerId = viewerId;
    }

    public LocalDateTime getViewedAt() {
        return viewedAt;
    }

    public void setViewedAt(LocalDateTime viewedAt) {
        this.viewedAt = viewedAt;
    }
}