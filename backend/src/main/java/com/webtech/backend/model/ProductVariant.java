package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "product_variants")
@Getter
@Setter
@NoArgsConstructor
public class ProductVariant implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    private Integer price;

    @Field("product_id")
    @JsonProperty("product_id")
    private String productId;

    @Field("stock_quantity")
    @JsonProperty("stock_quantity")
    private Integer stockQuantity;

    @Field("variant_name")
    @JsonProperty("variant_name")
    private String variantName;
}
