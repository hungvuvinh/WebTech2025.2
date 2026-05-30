package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class CheckoutRequest {

    @NotBlank(message = "customer_id is required")
    @JsonProperty("customer_id")
    private String customerId;

    @NotBlank(message = "method is required")
    private String method;

    @NotBlank(message = "shipping_address is required")
    @JsonProperty("shipping_address")
    private String shippingAddress;

    @JsonProperty("selected_product_variant_ids")
    private List<String> selectedProductVariantIds;

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

    public List<String> getSelectedProductVariantIds() {
        return selectedProductVariantIds;
    }

    public void setSelectedProductVariantIds(List<String> selectedProductVariantIds) {
        this.selectedProductVariantIds = selectedProductVariantIds;
    }
}
