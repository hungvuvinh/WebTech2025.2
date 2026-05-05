package com.webtech.backend.controller;

import com.webtech.backend.dto.CreateConversationRequest;
import com.webtech.backend.dto.SendMessageRequest;
import com.webtech.backend.exception.BadRequestException;
import com.webtech.backend.model.Conversation;
import com.webtech.backend.model.Message;
import com.webtech.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Chat giữa khách hàng và người bán: hội thoại + tin nhắn, kiểm tra người gửi thuộc cuộc trò chuyện.
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/conversations")
    public ResponseEntity<Conversation> createOrGetConversation(@RequestBody CreateConversationRequest body) {
        Conversation conv = chatService.getOrCreateConversation(body.getCustomerId(), body.getSellerId());
        return ResponseEntity.ok(conv);
    }

    @GetMapping("/conversations")
    public List<Conversation> listConversations(
            @RequestParam(required = false) String customer_id,
            @RequestParam(required = false) String seller_id) {
        boolean hasCustomer = StringUtils.hasText(customer_id);
        boolean hasSeller = StringUtils.hasText(seller_id);
        if (hasCustomer == hasSeller) {
            throw new BadRequestException("Truyền đúng một tham số: customer_id hoặc seller_id.");
        }
        if (hasCustomer) {
            return chatService.listForCustomer(customer_id);
        }
        return chatService.listForSeller(seller_id);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public List<Message> listMessages(@PathVariable String conversationId) {
        return chatService.listMessages(conversationId);
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Message> sendMessage(
            @PathVariable String conversationId,
            @RequestBody SendMessageRequest body) {
        Message saved = chatService.sendMessage(
                conversationId,
                body.getSenderId(),
                body.getSenderType(),
                body.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
