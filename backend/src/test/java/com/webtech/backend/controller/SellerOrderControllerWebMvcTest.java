package com.webtech.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webtech.backend.dto.OrderStatisticsResponse;
import com.webtech.backend.dto.UpdateOrderStatusRequest;
import com.webtech.backend.model.Order;
import com.webtech.backend.service.SellerOrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SellerOrderController.class)
class SellerOrderControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SellerOrderService sellerOrderService;

    @Test
    void listOrders() throws Exception {
        Order o = new Order();
        o.setId("o1");
        when(sellerOrderService.listOrdersForSeller("sell1")).thenReturn(List.of(o));

        mockMvc.perform(get("/api/sellers/sell1/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]._id").value("o1"));
    }

    @Test
    void patchStatus() throws Exception {
        Order o = new Order();
        o.setId("o1");
        o.setStatus("SHIPPED");
        when(sellerOrderService.updateOrderStatus("sell1", "o1", "SHIPPED")).thenReturn(o);

        UpdateOrderStatusRequest req = new UpdateOrderStatusRequest();
        req.setStatus("SHIPPED");

        mockMvc.perform(patch("/api/sellers/sell1/orders/o1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._id").value("o1"))
                .andExpect(jsonPath("$.status").value("SHIPPED"));
    }

    @Test
    void getStatistics() throws Exception {
        OrderStatisticsResponse statistics = new OrderStatisticsResponse(
                3,
                new BigDecimal("2125000"),
                new BigDecimal("708333.33"),
                Map.of("PENDING", 2L, "SHIPPED", 1L)
        );

        when(sellerOrderService.getOrderStatisticsForSeller("sell1")).thenReturn(statistics);

        mockMvc.perform(get("/api/sellers/sell1/orders/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.order_count").value(3))
                .andExpect(jsonPath("$.total_revenue").value(2125000))
                .andExpect(jsonPath("$.average_order_value").value(708333.33))
                .andExpect(jsonPath("$.status_counts.PENDING").value(2))
                .andExpect(jsonPath("$.status_counts.SHIPPED").value(1));
    }
}
