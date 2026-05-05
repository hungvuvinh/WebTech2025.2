package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "reviews")
@Getter
@Setter
@NoArgsConstructor
public class Review implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    private String comment;

    @Field("created_at")
    @JsonProperty("created_at")
    private Instant createdAt;

    @Field("customer_id")
    @JsonProperty("customer_id")
    private String customerId;

    @Field("product_id")
    @JsonProperty("product_id")
    private String productId;

    @Field("product_variant_id")
    @JsonProperty("product_variant_id")
    private String productVariantId;

    private Double rating;
}
