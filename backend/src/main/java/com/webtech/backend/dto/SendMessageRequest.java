package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SendMessageRequest {

    @JsonProperty("sender_id")
    private String senderId;

    @JsonProperty("sender_type")
    private String senderType;

    private String content;
}
