package com.code.codenest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "group_snips")
public class GroupSnip {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    @ManyToOne
    @JoinColumn(name = "snip_id")
    private Snip snip;

    @Column(name = "shared_by_id")
    private Long sharedById;

    @Column(name = "shared_at")
    private LocalDateTime sharedAt = LocalDateTime.now();

    public GroupSnip() {
    }

    public Long getId() {
        return id;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Snip getSnip() {
        return snip;
    }

    public void setSnip(Snip snip) {
        this.snip = snip;
    }

    public Long getSharedById() {
        return sharedById;
    }

    public void setSharedById(Long sharedById) {
        this.sharedById = sharedById;
    }

    public LocalDateTime getSharedAt() {
        return sharedAt;
    }

    public void setSharedAt(LocalDateTime sharedAt) {
        this.sharedAt = sharedAt;
    }
}