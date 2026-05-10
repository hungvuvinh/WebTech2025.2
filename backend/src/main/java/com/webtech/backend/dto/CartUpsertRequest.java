package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.webtech.backend.model.CartItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CartUpsertRequest {

    @NotBlank(message = "customer_id is required")
    @JsonProperty("customer_id")
    private String customerId;

    @NotNull(message = "item is required")
    @JsonProperty("item")
    private List<CartItem> item;

    public CartUpsertRequest() {}

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public List<CartItem> getItem() {
        return item;
    }

    public void setItem(List<CartItem> item) {
        this.item = item;
    }
}

