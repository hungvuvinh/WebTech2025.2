package com.webtech.backend.repository;

import com.webtech.backend.model.ProductVariant;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductVariantRepository extends MongoRepository<ProductVariant, String> {
}
