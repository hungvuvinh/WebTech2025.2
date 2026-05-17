package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class CheckoutRequest {

    @NotBlank(message = "customer_id is required")
    @JsonProperty("customer_id")
    private String customerId;

    @NotBlank(message = "method is required")
    private String method;

    @NotBlank(message = "shipping_address is required")
    @JsonProperty("shipping_address")
    private String shippingAddress;

    public CheckoutRequest() {}

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}
