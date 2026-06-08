package com.webtech.backend.service;

import com.webtech.backend.model.Conversation;
import com.webtech.backend.repository.ConversationRepository;
import com.webtech.backend.repository.CustomerRepository;
import com.webtech.backend.repository.MessageRepository;
import com.webtech.backend.repository.SellerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private SellerRepository sellerRepository;

    @InjectMocks
    private ChatService chatService;

    @Test
    void getOrCreateConversation_usesFirstMatchingConversationWhenDuplicatesExist() {
        Conversation existing = new Conversation();
        existing.setId("conv-1");
        existing.setCustomerId("cust-1");
        existing.setSellerId("sell-1");

        when(customerRepository.findById("cust-1")).thenReturn(Optional.of(new com.webtech.backend.model.Customer()));
        when(sellerRepository.findById("sell-1")).thenReturn(Optional.of(new com.webtech.backend.model.Seller()));
        when(conversationRepository.findFirstByCustomerIdAndSellerId("cust-1", "sell-1"))
                .thenReturn(Optional.of(existing));

        Conversation result = chatService.getOrCreateConversation("cust-1", "sell-1");

        assertSame(existing, result);
        verify(conversationRepository).findFirstByCustomerIdAndSellerId("cust-1", "sell-1");
    }
}
