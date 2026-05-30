package com.webtech.backend.service;

import com.webtech.backend.dto.CheckoutRequest;
import com.webtech.backend.dto.VnpayCheckoutResponse;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductVariantRepository productVariantRepository;
    private final VnpayGatewayService vnpayGatewayService;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            CartService cartService,
            ProductVariantRepository productVariantRepository,
            VnpayGatewayService vnpayGatewayService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.productVariantRepository = productVariantRepository;
        this.vnpayGatewayService = vnpayGatewayService;
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
        Order savedOrder = createOrderFromCart(request, "CREATED", true);

        createPayment(request.getMethod(), savedOrder.getId(), "PAID");
        cartService.removeItems(request.getCustomerId(), toCartItems(savedOrder.getItems()));

        return savedOrder;
    }

    @Transactional
    public VnpayCheckoutResponse checkoutWithVnpay(CheckoutRequest request) {
        Order savedOrder = createOrderFromCart(request, "PENDING", false);
        Payment payment = createPayment("VNPAY", savedOrder.getId(), "PENDING");
        String paymentUrl = vnpayGatewayService.buildPaymentUrl(savedOrder, payment, null);

        return new VnpayCheckoutResponse(
                savedOrder.getId(),
                payment.getId(),
            paymentUrl,
                savedOrder.getStatus(),
                payment.getStatus()
        );
    }

    @Transactional
    public Order confirmVnpayPayment(String paymentId, boolean success) {
        Payment payment = findById(paymentId);
        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", payment.getOrderId()));

        if (success) {
            if ("PAID".equalsIgnoreCase(payment.getStatus())) {
                return order;
            }

            try {
                deductStockForOrder(order);
            } catch (RuntimeException ex) {
                payment.setStatus("FAILED");
                order.setStatus("CANCELLED");
                paymentRepository.save(payment);
                orderRepository.save(order);
                throw ex;
            }

            payment.setStatus("PAID");
            order.setStatus("CREATED");
            paymentRepository.save(payment);
            orderRepository.save(order);
            cartService.removeItems(order.getCustomerId(), toCartItems(order.getItems()));
            return order;
        }

        payment.setStatus("CANCELLED");
        order.setStatus("CANCELLED");
        paymentRepository.save(payment);
        orderRepository.save(order);
        return order;
    }

    @Transactional
    public Order confirmVnpayCallback(String paymentId, boolean success) {
        return confirmVnpayPayment(paymentId, success);
    }

    private Order createOrderFromCart(CheckoutRequest request, String status, boolean deductStock) {
        Cart cart = cartService.findByCustomerId(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart", request.getCustomerId()));

        List<CartItem> items = cart.getItem();
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Set<String> selectedVariantIds = null;
        if (request.getSelectedProductVariantIds() != null && !request.getSelectedProductVariantIds().isEmpty()) {
            selectedVariantIds = new HashSet<>(request.getSelectedProductVariantIds());
        }

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());

        List<OrderItem> orderItems = new ArrayList<>();
        long total = 0L;

        for (CartItem ci : items) {
            if (selectedVariantIds != null && !selectedVariantIds.contains(ci.getProductVariantId())) {
                continue;
            }

            ProductVariant pv = null;
            if (ci.getProductVariantId() != null) {
                pv = productVariantRepository.findById(ci.getProductVariantId()).orElse(null);
            }

            int unitPrice = pv != null && pv.getPrice() != null ? pv.getPrice() : 0;
            int qty = ci.getQuantity() != null ? ci.getQuantity() : 0;

            if (qty <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero");
            }

            if (deductStock && pv != null) {
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

            if (deductStock && pv != null) {
                int stock = pv.getStockQuantity() != null ? pv.getStockQuantity() : 0;
                pv.setStockQuantity(Math.max(0, stock - qty));
                productVariantRepository.save(pv);
            }
        }

        if (orderItems.isEmpty()) {
            throw new IllegalArgumentException("No selected cart items found");
        }

        order.setItems(orderItems);
        order.setOrderDate(Instant.now());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(status);
        order.setTotalAmount(String.valueOf(total));
        return orderRepository.save(order);
    }

    private Payment createPayment(String method, String orderId, String status) {
        Payment payment = new Payment();
        payment.setMethod(method);
        payment.setOrderId(orderId);
        payment.setStatus(status);
        return paymentRepository.save(payment);
    }

    private void deductStockForOrder(Order order) {
        List<OrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) {
            return;
        }

        for (OrderItem item : items) {
            if (item.getProductVariantId() == null) {
                continue;
            }

            ProductVariant pv = productVariantRepository.findById(item.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", item.getProductVariantId()));

            int qty = item.getQuantity() != null ? Integer.parseInt(item.getQuantity()) : 0;
            int stock = pv.getStockQuantity() != null ? pv.getStockQuantity() : 0;
            if (stock < qty) {
                throw new IllegalStateException("Insufficient stock for product variant: " + item.getProductVariantId());
            }

            pv.setStockQuantity(stock - qty);
            productVariantRepository.save(pv);
        }
    }

    private List<CartItem> toCartItems(List<OrderItem> orderItems) {
        List<CartItem> cartItems = new ArrayList<>();
        if (orderItems == null || orderItems.isEmpty()) {
            return cartItems;
        }

        for (OrderItem orderItem : orderItems) {
            CartItem cartItem = new CartItem();
            cartItem.setProductId(orderItem.getProductId());
            cartItem.setProductVariantId(orderItem.getProductVariantId());
            cartItem.setQuantity(orderItem.getQuantity() != null ? Integer.parseInt(orderItem.getQuantity()) : 0);
            cartItems.add(cartItem);
        }

        return cartItems;
    }
}
