package com.webtech.backend.service;

import com.webtech.backend.config.VnpayProperties;
import com.webtech.backend.model.Order;
import com.webtech.backend.model.Payment;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VnpayGatewayServiceTest {

    @Test
    void buildPaymentUrl_containsConfiguredGatewayAndSignsRequest() {
        VnpayProperties properties = new VnpayProperties();
        properties.setPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        properties.setTmnCode("TMN123");
        properties.setSecretKey("SECRET123");
        properties.setReturnUrl("http://localhost:8080/api/payments/vnpay/return");
        properties.setIpnUrl("http://localhost:8080/api/payments/vnpay/ipn");

        VnpayGatewayService service = new VnpayGatewayService(properties);

        Order order = new Order();
        order.setId("order-1");
        order.setTotalAmount("120000");

        Payment payment = new Payment();
        payment.setId("payment-1");

        String url = service.buildPaymentUrl(order, payment, "127.0.0.1");

        assertTrue(url.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?"));
        assertTrue(url.contains("vnp_TmnCode=TMN123"));
        assertTrue(url.contains("vnp_TxnRef=payment-1"));
        assertTrue(url.contains("vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fpayments%2Fvnpay%2Freturn"));
        assertTrue(url.contains("vnp_SecureHash="));
    }

    @Test
    void isValidSignature_returnsFalseForMissingHash() {
        VnpayProperties properties = new VnpayProperties();
        properties.setPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        properties.setTmnCode("TMN123");
        properties.setSecretKey("SECRET123");
        properties.setReturnUrl("http://localhost:8080/api/payments/vnpay/return");
        properties.setIpnUrl("http://localhost:8080/api/payments/vnpay/ipn");

        VnpayGatewayService service = new VnpayGatewayService(properties);

        assertFalse(service.isValidSignature(Map.of("vnp_TxnRef", "payment-1")));
    }
}