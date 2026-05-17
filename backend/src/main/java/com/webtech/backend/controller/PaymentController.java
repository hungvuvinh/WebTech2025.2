package com.webtech.backend.controller;

import com.webtech.backend.dto.CheckoutRequest;
import com.webtech.backend.model.Order;
import com.webtech.backend.model.Payment;
import com.webtech.backend.repository.PaymentRepository;
import com.webtech.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController extends AbstractMongoCrudController<Payment> {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @Override
    protected MongoRepository<Payment, String> repository() {
        return paymentRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Payment";
    }

    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(@RequestBody CheckoutRequest request) {
        Order order = paymentService.checkout(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
}
