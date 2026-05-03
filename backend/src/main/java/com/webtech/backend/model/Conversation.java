package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "conversations")
@Getter
@Setter
@NoArgsConstructor
public class Conversation implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    @Field("created_at")
    @JsonProperty("created_at")
    private Instant createdAt;

    @Field("customer_id")
    @JsonProperty("customer_id")
    private String customerId;

    @Field("seller_id")
    @JsonProperty("seller_id")
    private String sellerId;
}
