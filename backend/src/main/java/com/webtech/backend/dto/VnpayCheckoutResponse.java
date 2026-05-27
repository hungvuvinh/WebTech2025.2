package com.webtech.backend.dto;

public record VnpayCheckoutResponse(
        String orderId,
        String paymentId,
        String paymentUrl,
        String orderStatus,
        String paymentStatus
) {
}