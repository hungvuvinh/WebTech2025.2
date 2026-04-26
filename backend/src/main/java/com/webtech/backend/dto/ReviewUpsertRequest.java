package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public class ReviewUpsertRequest {

    private String comment;

    @JsonProperty("created_at")
    private Date createdAt;

    @NotBlank(message = "customer_id is required")
    @JsonProperty("customer_id")
    private String customerId;

    @NotBlank(message = "product_id is required")
    @JsonProperty("product_id")
    private String productId;

    @JsonProperty("product_variant_id")
    private String productVariantId;

    @NotNull(message = "rating is required")
    @Min(value = 0, message = "rating must be >= 0")
    @Max(value = 5, message = "rating must be <= 5")
    private Double rating;

    public ReviewUpsertRequest() {}

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

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}

