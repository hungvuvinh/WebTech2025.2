package com.webtech.backend.controller;

import com.webtech.backend.dto.SendMessageRequest;
import com.webtech.backend.model.Message;
import com.webtech.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{conversationId}/send")
    public void sendMessage(
            @DestinationVariable String conversationId,
            SendMessageRequest request) {
        try {
            Message message = chatService.sendMessage(
                    conversationId,
                    request.getSenderId(),
                    request.getSenderType(),
                    request.getContent()
            );
            String destination = "/topic/conversations/" + conversationId;
            log.info("Broadcasting message to {}", destination);
            messagingTemplate.convertAndSend(destination, message);
        } catch (Exception e) {
            log.error("Error sending message", e);
            throw e;
        }
    }
}
