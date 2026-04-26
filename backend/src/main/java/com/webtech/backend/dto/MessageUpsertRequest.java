package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class MessageUpsertRequest {

    @NotBlank(message = "content is required")
    private String content;

    @NotBlank(message = "conversation_id is required")
    @JsonProperty("conversation_id")
    private String conversationId;

    @NotBlank(message = "sender_id is required")
    @JsonProperty("sender_id")
    private String senderId;

    @NotBlank(message = "sender_type is required")
    @JsonProperty("sender_type")
    private String senderType;

    public MessageUpsertRequest() {}

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }
}

