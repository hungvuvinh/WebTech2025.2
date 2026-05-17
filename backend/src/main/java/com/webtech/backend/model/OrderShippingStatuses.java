package com.webtech.backend.model;

import java.util.List;
import java.util.Set;

/**
 * Trạng thái đơn được coi là "đang vận chuyển" (chưa giao xong).
 */
public final class OrderShippingStatuses {

    public static final String CREATED = "CREATED";
    public static final String PENDING = "PENDING";
    public static final String CONFIRMED = "CONFIRMED";
    public static final String SHIPPED = "SHIPPED";
    public static final String COMPLETED = "COMPLETED";
    public static final String CANCELLED = "CANCELLED";

    /** Đã xác nhận hoặc đang trên đường giao — khách/seller theo dõi tại tab "Đang vận chuyển". */
    public static final List<String> IN_TRANSIT = List.of(CONFIRMED, SHIPPED);

    private static final Set<String> IN_TRANSIT_SET = Set.copyOf(IN_TRANSIT);

    private OrderShippingStatuses() {}

    public static boolean isInTransit(String status) {
        return status != null && IN_TRANSIT_SET.contains(status.trim().toUpperCase());
    }
}
