package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "carts")
public class Cart {
    @Id
    @JsonProperty("_id")
    private String id;

    @JsonProperty("customer_id")
    private String customerId;

    @JsonProperty("item")
    private List<CartItem> item = new ArrayList<>();

    public Cart() {}

    public Cart(String id, String customerId, List<CartItem> item) {
        this.id = id;
        this.customerId = customerId;
        this.item = item;
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

    public List<CartItem> getItem() {
        return item;
    }

    public void setItem(List<CartItem> item) {
        this.item = item;
    }

    public static class CartItem {
        @JsonProperty("product_id")
        private String productId;

        @JsonProperty("product_variant_id")
        private String productVariantId;

        private int quantity;

        public CartItem() {}

        public CartItem(String productId, String productVariantId, int quantity) {
            this.productId = productId;
            this.productVariantId = productVariantId;
            this.quantity = quantity;
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

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }
}

