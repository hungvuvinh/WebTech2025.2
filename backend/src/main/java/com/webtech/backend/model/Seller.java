package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "sellers")
@Getter
@Setter
@NoArgsConstructor
public class Seller implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    private String email;

    @Field("phone_number")
    @JsonProperty("phone_number")
    private String phoneNumber;

    @Field("seller_name")
    @JsonProperty("seller_name")
    private String sellerName;
}
