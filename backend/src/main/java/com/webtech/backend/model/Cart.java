package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "carts")
@Getter
@Setter
@NoArgsConstructor
public class Cart implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    @Field("customer_id")
    @JsonProperty("customer_id")
    private String customerId;

    @Field("item")
    @JsonProperty("item")
    private List<CartItem> item;
}
