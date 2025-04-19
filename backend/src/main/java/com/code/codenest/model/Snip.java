package com.code.codenest.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Entity
@Table(name = "snips")
public class Snip {
    private static final Logger logger = LoggerFactory.getLogger(Snip.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uuid = UUID.randomUUID().toString();

    @Column(name = "user_id")
    private Long userId;

    private String title;

    @Column(columnDefinition = "text")
    private String content;

    @Column(name = "expiration_type")
    private String expirationType; // "TIME" or "VIEWS"

    @Column(name = "expiration_value")
    private Long expirationValue;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "view_count")
    private Long viewCount = 0L;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    // For backward compatibility
    @Transient
    private String authorUuid;

    @OneToMany(mappedBy = "snip", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SnipTag> snipTags = new HashSet<>();

    @OneToMany(mappedBy = "snip", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ViewLog> viewLogs = new HashSet<>();

    public Snip() {
    }

    public Long getId() {
        return id;
    }

    public String getUuid() {
        return uuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // For backward compatibility
    public String getAuthorUuid() {
        return authorUuid;
    }

    // For backward compatibility
    public void setAuthorUuid(String authorUuid) {
        this.authorUuid = authorUuid;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    // For backward compatibility
    public String getCode() {
        return content;
    }

    // For backward compatibility
    public void setCode(String code) {
        this.content = code;
    }

    public String getExpirationType() {
        return expirationType;
    }

    public void setExpirationType(String expirationType) {
        this.expirationType = expirationType;
    }

    public Long getExpirationValue() {
        return expirationValue;
    }

    public void setExpirationValue(Long expirationValue) {
        this.expirationValue = expirationValue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // For backward compatibility
    public String getDate() {
        return createdAt.format(FORMATTER);
    }

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public void increaseViewCount() {
        viewCount++;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    // For backward compatibility
    public void setTimeLimit(long seconds) {
        this.expirationType = "TIME";
        this.expirationValue = seconds;
    }

    // For backward compatibility
    public long getTimeLimit() {
        return "TIME".equals(expirationType) ? expirationValue : 0L;
    }

    // For backward compatibility
    public void setViewLimit(long viewLimit) {
        this.expirationType = "VIEWS";
        this.expirationValue = viewLimit;
    }

    // For backward compatibility
    public long getViewLimit() {
        return "VIEWS".equals(expirationType) ? expirationValue : 0L;
    }

    @JsonIgnore
    public boolean isAccessible() {
        // Add logging here
        logger.debug("Checking accessibility for Snip UUID {}: isDeleted={}, expirationType={}, expirationValue={}, viewCount={}",
                this.uuid, this.isDeleted, this.expirationType, this.expirationValue, this.viewCount);

        if (isDeleted) {
            logger.debug("Snip {} inaccessible: isDeleted=true", this.uuid);
            return false;
        }

        boolean timeOk = true;
        if ("TIME".equals(expirationType) && expirationValue != null && expirationValue > 0) {
            LocalDateTime expiryTime = createdAt.plusSeconds(expirationValue);
            timeOk = LocalDateTime.now().isBefore(expiryTime);
            logger.debug("Snip {} time check: expiryTime={}, now={}, timeOk={}", this.uuid, expiryTime, LocalDateTime.now(), timeOk);
        }

        boolean viewsOk = true;
        if ("VIEWS".equals(expirationType) && expirationValue != null && expirationValue > 0) {
            viewsOk = viewCount < expirationValue;
            logger.debug("Snip {} views check: viewCount={}, expirationValue={}, viewsOk={}", this.uuid, viewCount, expirationValue, viewsOk);
        }

        boolean accessible = timeOk && viewsOk;
        logger.debug("Snip {} final accessibility: {}", this.uuid, accessible);
        return accessible;
    }

    // For backward compatibility
    @JsonGetter("remainingSeconds")
    public long getRemainingSeconds() {
        if ("TIME".equals(expirationType) && expirationValue > 0) {
            LocalDateTime expiryTime = createdAt.plusSeconds(expirationValue);
            if (LocalDateTime.now().isBefore(expiryTime)) {
                return Duration.between(LocalDateTime.now(), expiryTime).getSeconds();
            }
        }
        return 0;
    }

    // For backward compatibility
    @JsonGetter("remainingViews")
    public long getRemainingViews() {
        if ("VIEWS".equals(expirationType) && expirationValue > 0) {
            return Math.max(expirationValue - viewCount, 0);
        }
        return 0;
    }

    // For backward compatibility
    @JsonGetter("expiryDate")
    public String getExpiryDate() {
        if ("TIME".equals(expirationType) && expirationValue > 0) {
            return createdAt.plusSeconds(expirationValue).format(FORMATTER);
        }
        return createdAt.format(FORMATTER);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Snip snip = (Snip) o;
        return uuid.equals(snip.uuid);
    }

    @Override
    public int hashCode() {
        return uuid.hashCode();
    }
}
