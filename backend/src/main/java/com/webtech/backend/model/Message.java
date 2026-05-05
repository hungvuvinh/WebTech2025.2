package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "messages")
@Getter
@Setter
@NoArgsConstructor
public class Message implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    private String content;

    @Field("conversation_id")
    @JsonProperty("conversation_id")
    private String conversationId;

    @Field("sender_id")
    @JsonProperty("sender_id")
    private String senderId;

    @Field("sender_type")
    @JsonProperty("sender_type")
    private String senderType;

    @Field("time_stamp")
    @JsonProperty("time_stamp")
    private Instant timeStamp;
}
