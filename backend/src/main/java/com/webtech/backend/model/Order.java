package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.List;

@Document(collection = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    @Field("customer_id")
    @JsonProperty("customer_id")
    private String customerId;

    private List<OrderItem> items;

    @Field("order_date")
    @JsonProperty("order_date")
    private Instant orderDate;

    @Field("shipping_address")
    @JsonProperty("shipping_address")
    private String shippingAddress;

    private String status;

    @Field("total_amount")
    @JsonProperty("total_amount")
    private String totalAmount;
}
