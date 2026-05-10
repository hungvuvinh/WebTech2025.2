package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.webtech.backend.model.OrderItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;
import java.util.List;

public class OrderUpsertRequest {

    @NotBlank(message = "customer_id is required")
    @JsonProperty("customer_id")
    private String customerId;

    @NotNull(message = "items is required")
    private List<OrderItem> items;

    @JsonProperty("order_date")
    private Date orderDate;

    @NotBlank(message = "shipping_address is required")
    @JsonProperty("shipping_address")
    private String shippingAddress;

    @NotBlank(message = "status is required")
    private String status;

    @NotBlank(message = "total_amount is required")
    @JsonProperty("total_amount")
    private String totalAmount;

    public OrderUpsertRequest() {}

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(String totalAmount) {
        this.totalAmount = totalAmount;
    }
}

