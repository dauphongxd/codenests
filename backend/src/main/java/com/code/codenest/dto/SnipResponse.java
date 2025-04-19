package com.code.codenest.dto;

import com.code.codenest.model.Snip;
import com.code.codenest.model.Tag;
// Make sure this import is present
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.format.DateTimeFormatter;
import java.util.List;

public class SnipResponse {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    private String uuid;
    private String title;
    private String content;
    private String expirationType;
    private long expirationValue;
    private String createdAt;
    private long viewCount;
    private UserResponse author;
    private List<String> tags;
    private boolean isAccessible; // Field to store the value
    private long remainingViews;
    private long remainingSeconds;

    public SnipResponse(Snip snip, UserResponse author, List<String> tags) {
        this.uuid = snip.getUuid();
        this.title = snip.getTitle();
        this.content = snip.getContent();
        this.expirationType = snip.getExpirationType();
        this.expirationValue = snip.getExpirationValue();
        this.createdAt = snip.getCreatedAt().format(FORMATTER);
        this.viewCount = snip.getViewCount();
        this.author = author;
        this.tags = tags;
        this.isAccessible = snip.isAccessible(); // Calculate and store
        this.remainingViews = snip.getRemainingViews();
        this.remainingSeconds = snip.getRemainingSeconds();
    }

    // --- GETTERS ---

    public String getUuid() { return uuid; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getExpirationType() { return expirationType; }
    public long getExpirationValue() { return expirationValue; }
    public String getCreatedAt() { return createdAt; }
    public long getViewCount() { return viewCount; }
    public UserResponse getAuthor() { return author; }
    public List<String> getTags() { return tags; }
    public long getRemainingViews() { return remainingViews; }
    public long getRemainingSeconds() { return remainingSeconds; }

    // Explicitly annotate the getter for Jackson serialization
    @JsonProperty("isAccessible")
    public boolean isAccessible() {
        return isAccessible;
    }
}