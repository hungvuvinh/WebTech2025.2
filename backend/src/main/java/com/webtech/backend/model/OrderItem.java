package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

    @Field("product_id")
    @JsonProperty("product_id")
    private String productId;

    @Field("product_variant_id")
    @JsonProperty("product_variant_id")
    private String productVariantId;

    private String quantity;

    @Field("unit_price")
    @JsonProperty("unit_price")
    private String unitPrice;
}
