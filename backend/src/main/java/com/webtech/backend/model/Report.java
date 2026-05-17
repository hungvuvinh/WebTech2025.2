package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "reports")
@Getter
@Setter
@NoArgsConstructor
public class Report implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    @Field("customer_id")
    @JsonProperty("customer_id")
    private String customerId;

    @Field("product_id")
    @JsonProperty("product_id")
    private String productId;

    private String description;

    @Field("report_type")
    @JsonProperty("report_type")
    private String reportType;

    @Field("created_at")
    @JsonProperty("created_at")
    private Instant createdAt;
}
