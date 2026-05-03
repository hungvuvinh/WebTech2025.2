package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateConversationRequest {

    @JsonProperty("customer_id")
    private String customerId;

    @JsonProperty("seller_id")
    private String sellerId;
}
