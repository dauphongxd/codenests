package com.code.codenest.dto;

public class MessageCreateRequest {
    private Long receiverId;
    private Long snipId;
    private String content;
    private String receiverEmail;
    private String snipUuid;

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public Long getSnipId() {
        return snipId;
    }

    public void setSnipId(Long snipId) {
        this.snipId = snipId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getReceiverEmail() {
        return receiverEmail;
    }

    public void setReceiverEmail(String receiverEmail) {
        this.receiverEmail = receiverEmail;
    }

    public String getSnipUuid() {
        return snipUuid;
    }

    public void setSnipUuid(String snipUuid) {
        this.snipUuid = snipUuid;
    }
}