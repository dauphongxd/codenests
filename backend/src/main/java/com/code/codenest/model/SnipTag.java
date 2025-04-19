package com.code.codenest.model;

import jakarta.persistence.*;

@Entity
@Table(name = "snip_tags")
public class SnipTag {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "snip_id")
    private Snip snip;

    @ManyToOne
    @JoinColumn(name = "tag_id")
    private Tag tag;

    public SnipTag() {
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

    public Tag getTag() {
        return tag;
    }

    public void setTag(Tag tag) {
        this.tag = tag;
    }
}
