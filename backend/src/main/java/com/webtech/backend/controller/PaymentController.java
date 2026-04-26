package com.webtech.backend.controller;

import com.webtech.backend.dto.PaymentUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.Payment;
import com.webtech.backend.repository.PaymentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;

    public PaymentController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @GetMapping
    public List<Payment> list() {
        return paymentRepository.findAll();
    }

    @GetMapping("/by-order/{orderId}")
    public Payment getByOrder(@PathVariable String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new NotFoundException("Payment not found for orderId=" + orderId));
    }

    @GetMapping("/{id}")
    public Payment get(@PathVariable String id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + id));
    }

    @PostMapping
    public ResponseEntity<Payment> create(@Valid @RequestBody PaymentUpsertRequest req) {
        Payment p = new Payment();
        p.setMethod(req.getMethod());
        p.setOrderId(req.getOrderId());
        p.setStatus(req.getStatus());
        Payment saved = paymentRepository.save(p);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Payment update(@PathVariable String id, @Valid @RequestBody PaymentUpsertRequest req) {
        Payment p = paymentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + id));
        p.setMethod(req.getMethod());
        p.setOrderId(req.getOrderId());
        p.setStatus(req.getStatus());
        return paymentRepository.save(p);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!paymentRepository.existsById(id)) {
            throw new NotFoundException("Payment not found: " + id);
        }
        paymentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

