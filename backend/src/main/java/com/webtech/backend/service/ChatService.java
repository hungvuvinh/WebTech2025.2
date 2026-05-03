package com.webtech.backend.service;

import com.webtech.backend.exception.BadRequestException;
import com.webtech.backend.exception.ForbiddenException;
import com.webtech.backend.exception.ResourceNotFoundException;
import com.webtech.backend.model.Conversation;
import com.webtech.backend.model.Message;
import com.webtech.backend.repository.ConversationRepository;
import com.webtech.backend.repository.CustomerRepository;
import com.webtech.backend.repository.MessageRepository;
import com.webtech.backend.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;

    public Conversation getOrCreateConversation(String customerId, String sellerId) {
        if (!StringUtils.hasText(customerId) || !StringUtils.hasText(sellerId)) {
            throw new BadRequestException("customer_id và seller_id là bắt buộc.");
        }
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));
        sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller", sellerId));

        return conversationRepository.findByCustomerIdAndSellerId(customerId, sellerId)
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setCustomerId(customerId);
                    c.setSellerId(sellerId);
                    c.setCreatedAt(Instant.now());
                    return conversationRepository.save(c);
                });
    }

    public List<Conversation> listForCustomer(String customerId) {
        if (!StringUtils.hasText(customerId)) {
            throw new BadRequestException("customer_id không được để trống.");
        }
        return conversationRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Conversation> listForSeller(String sellerId) {
        if (!StringUtils.hasText(sellerId)) {
            throw new BadRequestException("seller_id không được để trống.");
        }
        return conversationRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
    }

    public List<Message> listMessages(String conversationId) {
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        return messageRepository.findByConversationIdOrderByTimeStampAsc(conversationId);
    }

    public Message sendMessage(String conversationId, String senderId, String senderTypeRaw, String content) {
        if (!StringUtils.hasText(content)) {
            throw new BadRequestException("content không được để trống.");
        }
        if (!StringUtils.hasText(senderId)) {
            throw new BadRequestException("sender_id không được để trống.");
        }
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));

        String type = senderTypeRaw == null ? "" : senderTypeRaw.trim().toLowerCase();
        if (!"customer".equals(type) && !"seller".equals(type)) {
            throw new BadRequestException("sender_type phải là \"customer\" hoặc \"seller\".");
        }
        if ("customer".equals(type) && !conv.getCustomerId().equals(senderId)) {
            throw new ForbiddenException("sender_id không khớp khách hàng trong cuộc trò chuyện.");
        }
        if ("seller".equals(type) && !conv.getSellerId().equals(senderId)) {
            throw new ForbiddenException("sender_id không khớp người bán trong cuộc trò chuyện.");
        }

        Message m = new Message();
        m.setConversationId(conversationId);
        m.setSenderId(senderId);
        m.setSenderType(type);
        m.setContent(content.trim());
        m.setTimeStamp(Instant.now());
        return messageRepository.save(m);
    }
}
