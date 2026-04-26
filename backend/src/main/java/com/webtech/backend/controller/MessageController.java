package com.webtech.backend.controller;

import com.webtech.backend.dto.MessageUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.Message;
import com.webtech.backend.repository.MessageRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository;

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping
    public List<Message> list(@RequestParam(value = "conversationId", required = false) String conversationId) {
        if (conversationId == null || conversationId.isBlank()) {
            return messageRepository.findAll();
        }
        return messageRepository.findByConversationIdOrderByTimeStampAsc(conversationId);
    }

    @GetMapping("/{id}")
    public Message get(@PathVariable String id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Message not found: " + id));
    }

    @PostMapping
    public ResponseEntity<Message> create(@Valid @RequestBody MessageUpsertRequest req) {
        Message m = new Message();
        m.setContent(req.getContent());
        m.setConversationId(req.getConversationId());
        m.setSenderId(req.getSenderId());
        m.setSenderType(req.getSenderType());
        m.setTimeStamp(new Date());
        Message saved = messageRepository.save(m);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Message update(@PathVariable String id, @Valid @RequestBody MessageUpsertRequest req) {
        Message m = messageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Message not found: " + id));
        m.setContent(req.getContent());
        m.setConversationId(req.getConversationId());
        m.setSenderId(req.getSenderId());
        m.setSenderType(req.getSenderType());
        return messageRepository.save(m);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!messageRepository.existsById(id)) {
            throw new NotFoundException("Message not found: " + id);
        }
        messageRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

