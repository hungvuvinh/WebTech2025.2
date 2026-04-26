package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.webtech.backend.model.Cart;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CartUpsertRequest {

    @NotBlank(message = "customer_id is required")
    @JsonProperty("customer_id")
    private String customerId;

    @NotNull(message = "item is required")
    @JsonProperty("item")
    private List<Cart.CartItem> item;

    public CartUpsertRequest() {}

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public List<Cart.CartItem> getItem() {
        return item;
    }

    public void setItem(List<Cart.CartItem> item) {
        this.item = item;
    }
}

