package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "orders")
public class Order {
    @Id
    @JsonProperty("_id")
    private String id;

    @JsonProperty("customer_id")
    private String customerId;

    private List<OrderItem> items = new ArrayList<>();

    @JsonProperty("order_date")
    private Date orderDate;

    @JsonProperty("shipping_address")
    private String shippingAddress;

    private String status;

    @JsonProperty("total_amount")
    private String totalAmount;

    public Order() {}

    public Order(
            String id,
            String customerId,
            List<OrderItem> items,
            Date orderDate,
            String shippingAddress,
            String status,
            String totalAmount
    ) {
        this.id = id;
        this.customerId = customerId;
        this.items = items;
        this.orderDate = orderDate;
        this.shippingAddress = shippingAddress;
        this.status = status;
        this.totalAmount = totalAmount;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public static class OrderItem {
        @JsonProperty("product_id")
        private String productId;

        @JsonProperty("product_variant_id")
        private String productVariantId;

        private String quantity;

        @JsonProperty("unit_price")
        private String unitPrice;

        public OrderItem() {}

        public OrderItem(String productId, String productVariantId, String quantity, String unitPrice) {
            this.productId = productId;
            this.productVariantId = productVariantId;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public String getProductVariantId() {
            return productVariantId;
        }

        public void setProductVariantId(String productVariantId) {
            this.productVariantId = productVariantId;
        }

        public String getQuantity() {
            return quantity;
        }

        public void setQuantity(String quantity) {
            this.quantity = quantity;
        }

        public String getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(String unitPrice) {
            this.unitPrice = unitPrice;
        }
    }
}

