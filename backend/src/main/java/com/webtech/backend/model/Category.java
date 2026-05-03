package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Category implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    @Field("category_name")
    @JsonProperty("category_name")
    private String categoryName;
}
