package com.webtech.backend.service;

import com.webtech.backend.dto.CheckoutRequest;
import com.webtech.backend.exception.ResourceNotFoundException;
import com.webtech.backend.model.Cart;
import com.webtech.backend.model.CartItem;
import com.webtech.backend.model.Order;
import com.webtech.backend.model.OrderItem;
import com.webtech.backend.model.Payment;
import com.webtech.backend.model.ProductVariant;
import com.webtech.backend.repository.OrderRepository;
import com.webtech.backend.repository.PaymentRepository;
import com.webtech.backend.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductVariantRepository productVariantRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            CartService cartService,
            ProductVariantRepository productVariantRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.productVariantRepository = productVariantRepository;
    }

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public Payment findById(String id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));
    }

    public List<Payment> findByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public Payment create(Payment payment) {
        payment.setId(null);
        return paymentRepository.save(payment);
    }

    public Payment update(String id, Payment payment) {
        Payment existingPayment = findById(id);
        if (payment.getMethod() != null) {
            existingPayment.setMethod(payment.getMethod());
        }
        if (payment.getOrderId() != null) {
            existingPayment.setOrderId(payment.getOrderId());
        }
        if (payment.getStatus() != null) {
            existingPayment.setStatus(payment.getStatus());
        }
        return paymentRepository.save(existingPayment);
    }

    public void delete(String id) {
        Payment payment = findById(id);
        paymentRepository.delete(payment);
    }

    @Transactional
    public Order checkout(CheckoutRequest request) {
        Cart cart = cartService.findByCustomerId(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", request.getCustomerId()));

        List<CartItem> items = cart.getItem();
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());

        List<OrderItem> orderItems = new ArrayList<>();
        long total = 0L;

        // Process each cart item
        for (CartItem ci : items) {
            ProductVariant pv = null;
            if (ci.getProductVariantId() != null) {
                pv = productVariantRepository.findById(ci.getProductVariantId()).orElse(null);
            }

            int unitPrice = pv != null && pv.getPrice() != null ? pv.getPrice() : 0;
            int qty = ci.getQuantity() != null ? ci.getQuantity() : 0;

            // Check stock availability
            if (pv != null) {
                int stock = pv.getStockQuantity() != null ? pv.getStockQuantity() : 0;
                if (stock < qty) {
                    throw new IllegalStateException("Insufficient stock for product variant: " + ci.getProductVariantId());
                }
            }

            OrderItem oi = new OrderItem();
            oi.setProductId(ci.getProductId());
            oi.setProductVariantId(ci.getProductVariantId());
            oi.setQuantity(String.valueOf(qty));
            oi.setUnitPrice(String.valueOf(unitPrice));
            orderItems.add(oi);

            total += (long) unitPrice * qty;

            // Deduct stock
            if (pv != null) {
                int stock = pv.getStockQuantity() != null ? pv.getStockQuantity() : 0;
                pv.setStockQuantity(Math.max(0, stock - qty));
                productVariantRepository.save(pv);
            }
        }

        order.setItems(orderItems);
        order.setOrderDate(Instant.now());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus("CREATED");
        order.setTotalAmount(String.valueOf(total));

        Order savedOrder = orderRepository.save(order);

        // Create payment record
        Payment payment = new Payment();
        payment.setMethod(request.getMethod());
        payment.setOrderId(savedOrder.getId());
        payment.setStatus("PAID");
        paymentRepository.save(payment);

        // Clear cart
        cartService.clearCart(request.getCustomerId());

        return savedOrder;
    }
}
