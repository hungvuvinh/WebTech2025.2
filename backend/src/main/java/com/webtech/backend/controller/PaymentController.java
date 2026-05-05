package com.webtech.backend.controller;

import com.webtech.backend.model.Payment;
import com.webtech.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController extends AbstractMongoCrudController<Payment> {

    private final PaymentRepository paymentRepository;

    @Override
    protected MongoRepository<Payment, String> repository() {
        return paymentRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Payment";
    }
}
