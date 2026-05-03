package com.webtech.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webtech.backend.dto.CreateConversationRequest;
import com.webtech.backend.dto.SendMessageRequest;
import com.webtech.backend.model.Conversation;
import com.webtech.backend.model.Message;
import com.webtech.backend.service.ChatService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
class ChatControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    @Test
    void listConversations_requiresExactlyOneQueryParam() throws Exception {
        mockMvc.perform(get("/api/chat/conversations"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/chat/conversations")
                        .param("customer_id", "c1")
                        .param("seller_id", "s1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listConversations_byCustomer() throws Exception {
        Conversation c = new Conversation();
        c.setId("conv1");
        c.setCustomerId("cust");
        c.setSellerId("sell");
        c.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        when(chatService.listForCustomer("cust")).thenReturn(List.of(c));

        mockMvc.perform(get("/api/chat/conversations").param("customer_id", "cust"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]._id").value("conv1"));
    }

    @Test
    void createConversation_returnsBody() throws Exception {
        Conversation c = new Conversation();
        c.setId("x");
        when(chatService.getOrCreateConversation("a", "b")).thenReturn(c);

        CreateConversationRequest req = new CreateConversationRequest();
        req.setCustomerId("a");
        req.setSellerId("b");

        mockMvc.perform(post("/api/chat/conversations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._id").value("x"));
    }

    @Test
    void sendMessage_created() throws Exception {
        Message m = new Message();
        m.setId("m1");
        when(chatService.sendMessage(ArgumentMatchers.eq("c1"), ArgumentMatchers.eq("cust"),
                ArgumentMatchers.eq("customer"), ArgumentMatchers.eq("hello")))
                .thenReturn(m);

        SendMessageRequest req = new SendMessageRequest();
        req.setSenderId("cust");
        req.setSenderType("customer");
        req.setContent("hello");

        mockMvc.perform(post("/api/chat/conversations/c1/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$._id").value("m1"));
    }
}
