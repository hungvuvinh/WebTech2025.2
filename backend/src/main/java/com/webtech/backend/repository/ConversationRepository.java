package com.webtech.backend.repository;

import com.webtech.backend.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByCustomerId(String customerId);
    List<Conversation> findBySellerId(String sellerId);
    Optional<Conversation> findByCustomerIdAndSellerId(String customerId, String sellerId);
}

