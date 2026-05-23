package com.webtech.backend.repository;

import com.webtech.backend.model.AuthAccount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AuthAccountRepository extends MongoRepository<AuthAccount, String> {

    Optional<AuthAccount> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);
}