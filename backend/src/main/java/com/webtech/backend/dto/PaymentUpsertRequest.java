package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class PaymentUpsertRequest {

    @NotBlank(message = "method is required")
    private String method;

    @NotBlank(message = "order_id is required")
    @JsonProperty("order_id")
    private String orderId;

    @NotBlank(message = "status is required")
    private String status;

    public PaymentUpsertRequest() {}

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

