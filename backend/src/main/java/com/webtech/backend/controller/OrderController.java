package com.webtech.backend.controller;

import com.webtech.backend.dto.OrderUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.Order;
import com.webtech.backend.repository.OrderRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public List<Order> list(@RequestParam(value = "customerId", required = false) String customerId) {
        if (customerId == null || customerId.isBlank()) {
            return orderRepository.findAll();
        }
        return orderRepository.findByCustomerId(customerId);
    }

    @GetMapping("/{id}")
    public Order get(@PathVariable String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));
    }

    @PostMapping
    public ResponseEntity<Order> create(@Valid @RequestBody OrderUpsertRequest req) {
        Order o = new Order();
        o.setCustomerId(req.getCustomerId());
        o.setItems(req.getItems());
        o.setOrderDate(req.getOrderDate() != null ? req.getOrderDate() : new Date());
        o.setShippingAddress(req.getShippingAddress());
        o.setStatus(req.getStatus());
        o.setTotalAmount(req.getTotalAmount());
        Order saved = orderRepository.save(o);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Order update(@PathVariable String id, @Valid @RequestBody OrderUpsertRequest req) {
        Order o = orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));
        o.setCustomerId(req.getCustomerId());
        o.setItems(req.getItems());
        o.setOrderDate(req.getOrderDate() != null ? req.getOrderDate() : o.getOrderDate());
        o.setShippingAddress(req.getShippingAddress());
        o.setStatus(req.getStatus());
        o.setTotalAmount(req.getTotalAmount());
        return orderRepository.save(o);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!orderRepository.existsById(id)) {
            throw new NotFoundException("Order not found: " + id);
        }
        orderRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

