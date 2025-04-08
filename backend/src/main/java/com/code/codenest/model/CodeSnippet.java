package com.code.codenest.model;


import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
@JsonIgnoreProperties({"id", "timeLimit"})
public class CodeSnippet {
    private static final LocalDateTime NO_EXPIRY =
            LocalDateTime.of(2000,1,1,0,0, 0, 0);

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    @Id @GeneratedValue private long id = 0L;

    private final String uuid = UUID.randomUUID().toString();

    private String authorUuid = "-";

    @Column(columnDefinition = "text")
    private String code = "";

    private final LocalDateTime date = LocalDateTime.now();

    private long timeLimit = 0L;
    private LocalDateTime expiryDate = NO_EXPIRY;

    private long viewCount = 0L;
    private long viewLimit = 0L;


    public long getId() {
        return id;
    }

    public String getUuid() {
        return uuid;
    }

    public String getAuthorUuid() {
        return authorUuid;
    }

    public void setAuthorUuid(String authorUuid) {
        this.authorUuid = authorUuid;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDate() {
        return date.format(FORMATTER);
    }

    public long getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(long timeLimitInSeconds) { // Renamed parameter for clarity
        if (timeLimitInSeconds > 0) {
            this.timeLimit = timeLimitInSeconds; // Store the original value (now represents seconds)
            // Change this line: Use plusSeconds() instead of plusMinutes()
            this.expiryDate = LocalDateTime.now().plusSeconds(timeLimitInSeconds);
        } else {
            this.timeLimit = 0L; // Represents no limit
            this.expiryDate = null;
        }
    }

    public String getExpiryDate() {
        return expiryDate.format(FORMATTER);
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public long getViewCount() {
        return viewCount;
    }

    public void setViewCount(long viewCount) {
        this.viewCount = viewCount;
    }

    public void increaseViewCount() {
        viewCount++;
    }

    public long getViewLimit() {
        return viewLimit;
    }

    public void setViewLimit(long viewLimit) {
        if (0 < viewLimit) {
            this.viewLimit = viewLimit;
        }
    }

    //@JsonIgnore
    public boolean isRestrictedByViews() {
        return 0 < viewLimit;
    }

    //@JsonIgnore
    public boolean isRestrictedByTime() {
        return 0 < timeLimit;
    }

    @JsonIgnore
    public boolean isAccessible() {
        // Check time limit if applicable
        boolean timeOk = (timeLimit == 0 || LocalDateTime.now().isBefore(expiryDate));

        // Check view limit if applicable
        boolean viewsOk = (viewLimit == 0 || viewCount < viewLimit);

        // Log both conditions for debugging
        System.out.println("Accessibility check: timeLimit=" + timeLimit +
                ", currentTime=" + LocalDateTime.now() +
                ", expiryDate=" + expiryDate +
                ", timeOk=" + timeOk +
                ", viewLimit=" + viewLimit +
                ", viewCount=" + viewCount +
                ", viewsOk=" + viewsOk);

        return timeOk && viewsOk;
    }

    @JsonGetter("remainingSeconds")
    public long getRemainingSeconds() {
        if (timeLimit > 0 && LocalDateTime.now().isBefore(expiryDate)) {
            return Duration.between(LocalDateTime.now(), expiryDate).getSeconds();
        }
        return 0;
    }

    @JsonGetter("remainingViews")
    public long getRemainingViews() {
        if (viewLimit > 0) {
            return Math.max(viewLimit - viewCount, 0);
        }
        return 0;
    }

    public String getDebugInfo() {
        return "CodeSnippet{" +
                "id=" + id +
                ", uuid='" + uuid + '\'' +
                ", authorUuid='" + authorUuid + '\'' +
                ", timeLimit=" + timeLimit +
                ", viewLimit=" + viewLimit +
                ", viewCount=" + viewCount +
                ", date=" + date +
                ", expiryDate=" + expiryDate +
                ", current time=" + LocalDateTime.now() +
                ", timeOk=" + (timeLimit == 0 || LocalDateTime.now().isBefore(expiryDate)) +
                ", viewsOk=" + (viewLimit == 0 || viewCount < viewLimit) +
                '}';
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        com.code.codenest.model.CodeSnippet that = (com.code.codenest.model.CodeSnippet) o;

        return uuid.equals(that.uuid);
    }



    @Override
    public int hashCode() {
        return uuid.hashCode();
    }

}
