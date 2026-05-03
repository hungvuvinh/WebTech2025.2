package com.webtech.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class OrderStatisticsResponse {

    @JsonProperty("order_count")
    private long orderCount;

    @JsonProperty("total_revenue")
    private BigDecimal totalRevenue;

    @JsonProperty("average_order_value")
    private BigDecimal averageOrderValue;

    @JsonProperty("status_counts")
    private Map<String, Long> statusCounts;

    public OrderStatisticsResponse(long orderCount,
                                   BigDecimal totalRevenue,
                                   BigDecimal averageOrderValue,
                                   Map<String, Long> statusCounts) {
        this.orderCount = orderCount;
        this.totalRevenue = totalRevenue;
        this.averageOrderValue = averageOrderValue;
        this.statusCounts = statusCounts;
    }
}
