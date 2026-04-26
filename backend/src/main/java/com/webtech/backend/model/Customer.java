package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "customers")
public class Customer {

    @Id
    @JsonProperty("_id")
    private String id;

    @NotBlank
    @JsonProperty("customer_name")
    private String customerName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @JsonProperty("phone_number")
    private String phoneNumber;

    public Customer() {
    }

    public Customer(String id, String customerName, String email, String phoneNumber) {
        this.id = id;
        this.customerName = customerName;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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