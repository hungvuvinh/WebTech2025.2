package com.webtech.backend.controller;

import com.webtech.backend.dto.CheckoutRequest;
import com.webtech.backend.dto.VnpayCheckoutResponse;
import com.webtech.backend.dto.VnpayConfirmRequest;
import com.webtech.backend.model.Order;
import com.webtech.backend.model.Payment;
import com.webtech.backend.repository.PaymentRepository;
import com.webtech.backend.service.VnpayGatewayService;
import com.webtech.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController extends AbstractMongoCrudController<Payment> {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final VnpayGatewayService vnpayGatewayService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

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

    @PostMapping("/vnpay/checkout")
    public ResponseEntity<VnpayCheckoutResponse> checkoutWithVnpay(@RequestBody CheckoutRequest request) {
        VnpayCheckoutResponse response = paymentService.checkoutWithVnpay(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/vnpay/confirm")
    public ResponseEntity<Order> confirmVnpay(@RequestBody VnpayConfirmRequest request) {
        Order order = paymentService.confirmVnpayPayment(request.getPaymentId(), request.isSuccess());
        return ResponseEntity.ok(order);
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> params) {
        Map<String, String> normalized = new LinkedHashMap<>(params);
        boolean validSignature = vnpayGatewayService.isValidSignature(normalized);
        String paymentId = normalized.getOrDefault("vnp_TxnRef", "");
        boolean success = validSignature
                && "00".equals(normalized.getOrDefault("vnp_ResponseCode", ""))
                && "00".equals(normalized.getOrDefault("vnp_TransactionStatus", ""));

        if (!paymentId.isBlank()) {
            paymentService.confirmVnpayPayment(paymentId, success);
        }

        String redirect = success
            ? frontendBaseUrl + "/orders?payment=vnpay-success"
            : frontendBaseUrl + "/checkout?payment=vnpay-failed";
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, redirect)
                .build();
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, Object>> vnpayIpn(@RequestParam Map<String, String> params) {
        Map<String, String> normalized = new LinkedHashMap<>(params);
        boolean validSignature = vnpayGatewayService.isValidSignature(normalized);
        String paymentId = normalized.getOrDefault("vnp_TxnRef", "");
        boolean success = validSignature
                && "00".equals(normalized.getOrDefault("vnp_ResponseCode", ""))
                && "00".equals(normalized.getOrDefault("vnp_TransactionStatus", ""));

        if (!paymentId.isBlank()) {
            paymentService.confirmVnpayPayment(paymentId, success);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("RspCode", success ? "00" : "97");
        body.put("Message", success ? "Confirm Success" : "Confirm Failed");
        return ResponseEntity.ok(body);
    }
}
