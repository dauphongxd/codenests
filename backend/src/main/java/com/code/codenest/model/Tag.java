package com.code.codenest.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tags")
public class Tag {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    @OneToMany(mappedBy = "tag", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SnipTag> snipTags = new HashSet<>();

    public Tag() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<SnipTag> getSnipTags() {
        return snipTags;
    }

    public void setSnipTags(Set<SnipTag> snipTags) {
        this.snipTags = snipTags;
    }
}