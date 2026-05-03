package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "payment")
@Getter
@Setter
@NoArgsConstructor
public class Payment implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    private String method;

    @Field("order_id")
    @JsonProperty("order_id")
    private String orderId;

    private String status;
}
