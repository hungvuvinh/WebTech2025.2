package com.webtech.backend.repository;

import com.webtech.backend.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByProductId(String productId);

    List<Review> findByCustomerId(String customerId);

    List<Review> findByProductIdAndCustomerId(String productId, String customerId);
}
