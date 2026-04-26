package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ProductVariantUpsertRequest {

    @NotNull(message = "price is required")
    @Min(value = 0, message = "price must be >= 0")
    private Integer price;

    @NotBlank(message = "product_id is required")
    @JsonProperty("product_id")
    private String productId;

    @NotNull(message = "stock_quantity is required")
    @Min(value = 0, message = "stock_quantity must be >= 0")
    @JsonProperty("stock_quantity")
    private Integer stockQuantity;

    @NotBlank(message = "variant_name is required")
    @JsonProperty("variant_name")
    private String variantName;

    public ProductVariantUpsertRequest() {}

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getVariantName() {
        return variantName;
    }

    public void setVariantName(String variantName) {
        this.variantName = variantName;
    }
}

