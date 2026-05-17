package com.webtech.backend.repository;

import com.webtech.backend.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Collection;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {

    @Query("{ 'items.product_id': { $in: ?0 } }")
    List<Order> findByItemsProductIdIn(Collection<String> productIds);

    List<Order> findByCustomerId(String customerId);

    List<Order> findByCustomerIdAndStatusIn(String customerId, Collection<String> statuses);
}
