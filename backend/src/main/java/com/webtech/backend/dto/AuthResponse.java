package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponse {

    private final String role;
    private final String userId;
    private final String userName;
    private final String email;

    @JsonProperty("phone_number")
    private final String phoneNumber;

    @JsonProperty("access_token")
    private final String accessToken;

    @JsonProperty("token_type")
    private final String tokenType;

    @JsonProperty("expires_in")
    private final long expiresIn;

    public AuthResponse(
            String role,
            String userId,
            String userName,
            String email,
            String phoneNumber,
            String accessToken,
            String tokenType,
            long expiresIn
    ) {
        this.role = role;
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
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

    public String getAccessToken() {
        return accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }
}