package com.webtech.backend.repository;

import com.webtech.backend.model.Seller;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SellerRepository extends MongoRepository<Seller, String> {}

