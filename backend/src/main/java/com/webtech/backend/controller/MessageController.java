package com.webtech.backend.controller;

import com.webtech.backend.model.Message;
import com.webtech.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController extends AbstractMongoCrudController<Message> {

    private final MessageRepository messageRepository;

    @Override
    protected MongoRepository<Message, String> repository() {
        return messageRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Message";
    }
}
