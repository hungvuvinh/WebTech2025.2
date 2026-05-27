package com.webtech.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webtech.backend.dto.CheckoutRequest;
import com.webtech.backend.dto.VnpayCheckoutResponse;
import com.webtech.backend.dto.VnpayConfirmRequest;
import com.webtech.backend.model.Order;
import com.webtech.backend.repository.PaymentRepository;
import com.webtech.backend.service.PaymentService;
import com.webtech.backend.service.VnpayGatewayService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
class PaymentControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentRepository paymentRepository;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private VnpayGatewayService vnpayGatewayService;

    @Test
    void checkout_withCod_returnsOrder() throws Exception {
        Order order = new Order();
        order.setId("o1");
        order.setOrderDate(Instant.parse("2026-01-01T00:00:00Z"));
        when(paymentService.checkout(org.mockito.ArgumentMatchers.any())).thenReturn(order);

        CheckoutRequest request = new CheckoutRequest();
        request.setCustomerId("cust1");
        request.setMethod("COD");
        request.setShippingAddress("123 Main Street");

        mockMvc.perform(post("/api/payments/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$._id").value("o1"));
    }

    @Test
    void checkout_withVnpay_returnsPaymentUrl() throws Exception {
        VnpayCheckoutResponse response = new VnpayCheckoutResponse("o1", "p1", "http://localhost:5173/payment/vnpay?paymentId=p1", "PENDING", "PENDING");
        when(paymentService.checkoutWithVnpay(org.mockito.ArgumentMatchers.any())).thenReturn(response);

        CheckoutRequest request = new CheckoutRequest();
        request.setCustomerId("cust1");
        request.setMethod("VNPAY");
        request.setShippingAddress("123 Main Street");

        mockMvc.perform(post("/api/payments/vnpay/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentUrl").value("http://localhost:5173/payment/vnpay?paymentId=p1"));
    }

    @Test
    void confirm_vnpay_returnsOrder() throws Exception {
        Order order = new Order();
        order.setId("o1");
        when(paymentService.confirmVnpayPayment("p1", true)).thenReturn(order);

        VnpayConfirmRequest request = new VnpayConfirmRequest();
        request.setPaymentId("p1");
        request.setSuccess(true);

        mockMvc.perform(post("/api/payments/vnpay/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._id").value("o1"));
    }
}