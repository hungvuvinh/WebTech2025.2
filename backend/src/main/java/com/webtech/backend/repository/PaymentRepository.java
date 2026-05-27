package com.webtech.backend.repository;

import com.webtech.backend.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {

    List<Payment> findByOrderId(String orderId);

    List<Payment> findByOrderIdInAndStatus(Collection<String> orderIds, String status);
}
