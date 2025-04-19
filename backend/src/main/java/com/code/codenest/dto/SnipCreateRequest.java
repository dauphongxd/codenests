package com.code.codenest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class SnipCreateRequest {
    @JsonProperty("title")
    private String title;

    @JsonProperty("content")
    private String content;

    @JsonProperty("expirationType")
    private String expirationType;

    @JsonProperty("expirationValue")
    private long expirationValue;

    @JsonProperty("tags")
    private List<String> tags;


    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getExpirationType() { return expirationType; }
    public long getExpirationValue() { return expirationValue; }
    public List<String> getTags() { return tags; }


    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
    public void setExpirationType(String expirationType) { this.expirationType = expirationType; }
    public void setExpirationValue(long expirationValue) { this.expirationValue = expirationValue; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
