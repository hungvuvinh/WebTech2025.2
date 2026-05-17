package com.webtech.backend.service;

import com.webtech.backend.exception.ResourceNotFoundException;
import com.webtech.backend.model.Order;
import com.webtech.backend.model.OrderShippingStatuses;
import com.webtech.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Order findById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    public List<Order> findByCustomerId(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<Order> findInTransitByCustomerId(String customerId) {
        return orderRepository.findByCustomerIdAndStatusIn(customerId, OrderShippingStatuses.IN_TRANSIT);
    }

    public Order create(Order order) {
        order.setId(null);
        return orderRepository.save(order);
    }

    public Order update(String id, Order order) {
        Order existingOrder = findById(id);
        if (order.getCustomerId() != null) {
            existingOrder.setCustomerId(order.getCustomerId());
        }
        if (order.getItems() != null) {
            existingOrder.setItems(order.getItems());
        }
        if (order.getOrderDate() != null) {
            existingOrder.setOrderDate(order.getOrderDate());
        }
        if (order.getShippingAddress() != null) {
            existingOrder.setShippingAddress(order.getShippingAddress());
        }
        if (order.getStatus() != null) {
            existingOrder.setStatus(order.getStatus());
        }
        if (order.getTotalAmount() != null) {
            existingOrder.setTotalAmount(order.getTotalAmount());
        }
        return orderRepository.save(existingOrder);
    }

    public void delete(String id) {
        Order order = findById(id);
        orderRepository.delete(order);
    }

    public List<Order> findByItemsProductIdIn(List<String> productIds) {
        return orderRepository.findByItemsProductIdIn(productIds);
    }
}
