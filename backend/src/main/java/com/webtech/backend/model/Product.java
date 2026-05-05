package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    private String brand;

    @Field("category_id")
    @JsonProperty("category_id")
    private String categoryId;

    @Field("product_name")
    @JsonProperty("product_name")
    private String productName;

    /**
     * Người bán sở hữu sản phẩm (mở rộng schema để hỗ trợ quản lý đơn theo seller).
     */
    @Field("seller_id")
    @JsonProperty("seller_id")
    private String sellerId;
}
