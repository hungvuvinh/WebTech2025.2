package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "conversations")
public class Conversation {
    @Id
    @JsonProperty("_id")
    private String id;

    @JsonProperty("created_at")
    private Date createdAt;

    @JsonProperty("customer_id")
    private String customerId;

    @JsonProperty("seller_id")
    private String sellerId;

    public Conversation() {}

    public Conversation(String id, Date createdAt, String customerId, String sellerId) {
        this.id = id;
        this.createdAt = createdAt;
        this.customerId = customerId;
        this.sellerId = sellerId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }
}

