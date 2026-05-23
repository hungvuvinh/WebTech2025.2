package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponse {

    private final String role;
    private final String userId;
    private final String userName;
    private final String email;

    @JsonProperty("phone_number")
    private final String phoneNumber;

    public AuthResponse(String role, String userId, String userName, String email, String phoneNumber) {
        this.role = role;
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }

    public String getRole() {
        return role;
    }

    public String getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }
}