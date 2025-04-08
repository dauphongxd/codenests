package com.code.codenest.dto; // Or your preferred package

public class SnippetCreateRequest {
    private String code;
    private long time_restriction;
    private long view_restriction;
    private String authorName;
    // No title field here


    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public long getTime_restriction() {
        return time_restriction;
    }

    public void setTime_restriction(long time_restriction) {
        this.time_restriction = time_restriction;
    }

    public long getView_restriction() {
        return view_restriction;
    }

    public void setView_restriction(long view_restriction) {
        this.view_restriction = view_restriction;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }
}