package com.webtech.backend.controller;

import com.webtech.backend.dto.ConversationUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.Conversation;
import com.webtech.backend.repository.ConversationRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationRepository conversationRepository;

    public ConversationController(ConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    @GetMapping
    public List<Conversation> list(
            @RequestParam(value = "customerId", required = false) String customerId,
            @RequestParam(value = "sellerId", required = false) String sellerId
    ) {
        if (customerId != null && !customerId.isBlank()) {
            return conversationRepository.findByCustomerId(customerId);
        }
        if (sellerId != null && !sellerId.isBlank()) {
            return conversationRepository.findBySellerId(sellerId);
        }
        return conversationRepository.findAll();
    }

    @GetMapping("/by-members")
    public Conversation getByMembers(@RequestParam("customerId") String customerId, @RequestParam("sellerId") String sellerId) {
        return conversationRepository.findByCustomerIdAndSellerId(customerId, sellerId)
                .orElseThrow(() -> new NotFoundException("Conversation not found for customerId=" + customerId + " sellerId=" + sellerId));
    }

    @GetMapping("/{id}")
    public Conversation get(@PathVariable String id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conversation not found: " + id));
    }

    @PostMapping
    public ResponseEntity<Conversation> create(@Valid @RequestBody ConversationUpsertRequest req) {
        Conversation c = new Conversation();
        c.setCustomerId(req.getCustomerId());
        c.setSellerId(req.getSellerId());
        c.setCreatedAt(new Date());
        Conversation saved = conversationRepository.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Conversation update(@PathVariable String id, @Valid @RequestBody ConversationUpsertRequest req) {
        Conversation c = conversationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conversation not found: " + id));
        c.setCustomerId(req.getCustomerId());
        c.setSellerId(req.getSellerId());
        return conversationRepository.save(c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!conversationRepository.existsById(id)) {
            throw new NotFoundException("Conversation not found: " + id);
        }
        conversationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

