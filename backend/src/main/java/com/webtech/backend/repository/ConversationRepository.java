package com.webtech.backend.repository;

import com.webtech.backend.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends MongoRepository<Conversation, String> {

    Optional<Conversation> findByCustomerIdAndSellerId(String customerId, String sellerId);

    List<Conversation> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Conversation> findBySellerIdOrderByCreatedAtDesc(String sellerId);
}
