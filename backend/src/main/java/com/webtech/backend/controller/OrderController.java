package com.webtech.backend.controller;

import com.webtech.backend.model.Order;
import com.webtech.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController extends AbstractMongoCrudController<Order> {

    private final OrderRepository orderRepository;

    @Override
    protected MongoRepository<Order, String> repository() {
        return orderRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Order";
    }
}
