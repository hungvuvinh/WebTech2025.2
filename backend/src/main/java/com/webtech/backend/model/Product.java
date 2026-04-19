package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
public class Product {
    @Id
    @JsonProperty("_id")
    private String id;

    private String brand;

    @JsonProperty("category_id")
    private String categoryId;

    @JsonProperty("product_name")
    private String productName;

    public Product() {}

    public Product(String id, String brand, String categoryId, String productName) {
        this.id = id;
        this.brand = brand;
        this.categoryId = categoryId;
        this.productName = productName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }
}

