package com.webtech.backend.controller;

import com.webtech.backend.model.Order;
import com.webtech.backend.repository.OrderRepository;
import com.webtech.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController extends AbstractMongoCrudController<Order> {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Override
    protected MongoRepository<Order, String> repository() {
        return orderRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Order";
    }

    @GetMapping("/customer/{customerId}")
    public List<Order> listByCustomer(@PathVariable String customerId) {
        return orderService.findByCustomerId(customerId);
    }

    /** Đơn đang vận chuyển (CONFIRMED, SHIPPED). */
    @GetMapping("/customer/{customerId}/in-transit")
    public List<Order> listInTransitByCustomer(@PathVariable String customerId) {
        return orderService.findInTransitByCustomerId(customerId);
    }
}
