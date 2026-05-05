package com.webtech.backend.controller;

import com.webtech.backend.model.Cart;
import com.webtech.backend.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController extends AbstractMongoCrudController<Cart> {

    private final CartRepository cartRepository;

    @Override
    protected MongoRepository<Cart, String> repository() {
        return cartRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Cart";
    }
}
