package com.webtech.backend.service;

import com.webtech.backend.model.Order;
import com.webtech.backend.model.Payment;
import com.webtech.backend.repository.OrderRepository;
import com.webtech.backend.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class PendingOrderCancellationService {

    private static final Logger logger = LoggerFactory.getLogger(PendingOrderCancellationService.class);

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Value("${app.orders.pending-timeout-minutes:15}")
    private long pendingTimeoutMinutes;

    public PendingOrderCancellationService(OrderRepository orderRepository, PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    @Scheduled(fixedDelayString = "${app.orders.pending-cancel-check-ms:60000}")
    public void cancelExpiredPendingOrders() {
        Instant cutoff = Instant.now().minusSeconds(pendingTimeoutMinutes * 60);

        List<Order> stalePendingOrders = orderRepository.findByStatusAndOrderDateLessThanEqual("PENDING", cutoff);
        if (stalePendingOrders.isEmpty()) {
            return;
        }

        List<String> orderIds = stalePendingOrders.stream()
                .map(Order::getId)
                .toList();

        List<Payment> pendingPayments = paymentRepository.findByOrderIdInAndStatus(orderIds, "PENDING");

        for (Order order : stalePendingOrders) {
            order.setStatus("CANCELLED");
        }

        for (Payment payment : pendingPayments) {
            payment.setStatus("CANCELLED");
        }

        orderRepository.saveAll(stalePendingOrders);
        if (!pendingPayments.isEmpty()) {
            paymentRepository.saveAll(pendingPayments);
        }

        logger.info("Auto-cancelled {} pending orders and {} pending payments older than {} minutes",
                stalePendingOrders.size(), pendingPayments.size(), pendingTimeoutMinutes);
    }
}
