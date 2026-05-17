package com.webtech.backend.controller;

import com.webtech.backend.dto.OrderStatisticsResponse;
import com.webtech.backend.dto.UpdateOrderStatusRequest;
import com.webtech.backend.model.Order;
import com.webtech.backend.service.SellerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Quản lý đơn hàng phía người bán: chỉ các đơn có ít nhất một sản phẩm thuộc seller (theo {@code products.seller_id}).
 */
@RestController
@RequestMapping("/api/sellers/{sellerId}/orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final SellerOrderService sellerOrderService;

    @GetMapping
    public List<Order> list(@PathVariable String sellerId) {
        return sellerOrderService.listOrdersForSeller(sellerId);
    }

    @GetMapping("/statistics")
    public OrderStatisticsResponse statistics(@PathVariable String sellerId) {
        return sellerOrderService.getOrderStatisticsForSeller(sellerId);
    }

    /** Đơn đang vận chuyển (CONFIRMED, SHIPPED) có sản phẩm của seller. */
    @GetMapping("/in-transit")
    public List<Order> listInTransit(@PathVariable String sellerId) {
        return sellerOrderService.listInTransitOrdersForSeller(sellerId);
    }

    @GetMapping("/{orderId}")
    public Order get(@PathVariable String sellerId, @PathVariable String orderId) {
        return sellerOrderService.getOrderForSeller(sellerId, orderId);
    }

    @PatchMapping("/{orderId}/status")
    public Order updateStatus(
            @PathVariable String sellerId,
            @PathVariable String orderId,
            @RequestBody UpdateOrderStatusRequest body) {
        return sellerOrderService.updateOrderStatus(sellerId, orderId, body.getStatus());
    }
}
