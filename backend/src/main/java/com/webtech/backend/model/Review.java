package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "reviews")
public class Review {
    @Id
    @JsonProperty("_id")
    private String id;

    private String comment;

    @JsonProperty("created_at")
    private Date createdAt;

    @JsonProperty("customer_id")
    private String customerId;

    @JsonProperty("product_id")
    private String productId;

    @JsonProperty("product_variant_id")
    private String productVariantId;

    private double rating;

    public Review() {}

    public Review(
            String id,
            String comment,
            Date createdAt,
            String customerId,
            String productId,
            String productVariantId,
            double rating
    ) {
        this.id = id;
        this.comment = comment;
        this.createdAt = createdAt;
        this.customerId = customerId;
        this.productId = productId;
        this.productVariantId = productVariantId;
        this.rating = rating;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductVariantId() {
        return productVariantId;
    }

    public void setProductVariantId(String productVariantId) {
        this.productVariantId = productVariantId;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }
}

