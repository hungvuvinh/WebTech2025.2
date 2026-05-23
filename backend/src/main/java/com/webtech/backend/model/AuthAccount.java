package com.webtech.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "auth_accounts")
@Getter
@Setter
@NoArgsConstructor
public class AuthAccount implements MongoDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    private String role;

    @Field("user_name")
    @JsonProperty("user_name")
    private String userName;

    @Indexed(unique = true)
    private String email;

    @Field("phone_number")
    @JsonProperty("phone_number")
    @Indexed(unique = true)
    private String phoneNumber;

    @JsonIgnore
    @Field("password_hash")
    private String passwordHash;
}