package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sellers")
public class Seller {
    @Id
    @JsonProperty("_id")
    private String id;

    @JsonProperty("seller_name")
    private String sellerName;

    private String email;

    @JsonProperty("phone_number")
    private String phoneNumber;

    public Seller() {}

    public Seller(String id, String sellerName, String email, String phoneNumber) {
        this.id = id;
        this.sellerName = sellerName;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}

