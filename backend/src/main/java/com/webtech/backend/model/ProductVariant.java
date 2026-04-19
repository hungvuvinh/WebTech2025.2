package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "product_variants")
public class ProductVariant {
    @Id
    @JsonProperty("_id")
    private String id;

    // NOTE: schema says int; later can change to double if needed
    private int price;

    @JsonProperty("product_id")
    private String productId;

    @JsonProperty("stock_quantity")
    private int stockQuantity;

    @JsonProperty("variant_name")
    private String variantName;

    public ProductVariant() {}

    public ProductVariant(String id, int price, String productId, int stockQuantity, String variantName) {
        this.id = id;
        this.price = price;
        this.productId = productId;
        this.stockQuantity = stockQuantity;
        this.variantName = variantName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getVariantName() {
        return variantName;
    }

    public void setVariantName(String variantName) {
        this.variantName = variantName;
    }
}

