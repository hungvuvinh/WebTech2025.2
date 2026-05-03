package com.webtech.backend.service;

import com.webtech.backend.exception.BadRequestException;
import com.webtech.backend.exception.ForbiddenException;
import com.webtech.backend.exception.ResourceNotFoundException;
import com.webtech.backend.model.Order;
import com.webtech.backend.model.OrderItem;
import com.webtech.backend.model.Product;
import com.webtech.backend.repository.OrderRepository;
import com.webtech.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SellerOrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public List<Order> listOrdersForSeller(String sellerId) {
        List<String> productIds = productRepository.findBySellerId(sellerId).stream()
                .map(Product::getId)
                .filter(Objects::nonNull)
                .toList();
        if (productIds.isEmpty()) {
            return List.of();
        }
        return orderRepository.findByItemsProductIdIn(productIds);
    }

    public Order getOrderForSeller(String sellerId, String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        assertSellerTouchesOrder(sellerId, order);
        return order;
    }

    public Order updateOrderStatus(String sellerId, String orderId, String newStatus) {
        if (!StringUtils.hasText(newStatus)) {
            throw new BadRequestException("status không được để trống.");
        }
        Order order = getOrderForSeller(sellerId, orderId);
        order.setStatus(newStatus.trim());
        return orderRepository.save(order);
    }

    private void assertSellerTouchesOrder(String sellerId, Order order) {
        Set<String> sellerProductIds = new HashSet<>();
        for (Product p : productRepository.findBySellerId(sellerId)) {
            if (p.getId() != null) {
                sellerProductIds.add(p.getId());
            }
        }
        if (sellerProductIds.isEmpty()) {
            throw new ForbiddenException("Người bán không có sản phẩm nào để liên kết với đơn hàng.");
        }
        List<OrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) {
            throw new ForbiddenException("Đơn hàng không có dòng sản phẩm.");
        }
        boolean touches = items.stream()
                .map(OrderItem::getProductId)
                .filter(Objects::nonNull)
                .anyMatch(sellerProductIds::contains);
        if (!touches) {
            throw new ForbiddenException("Đơn hàng không chứa sản phẩm thuộc người bán này.");
        }
    }
}
