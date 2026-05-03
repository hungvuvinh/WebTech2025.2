package com.webtech.backend.controller;

import com.webtech.backend.model.Conversation;
import com.webtech.backend.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController extends AbstractMongoCrudController<Conversation> {

    private final ConversationRepository conversationRepository;

    @Override
    protected MongoRepository<Conversation, String> repository() {
        return conversationRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Conversation";
    }
}
