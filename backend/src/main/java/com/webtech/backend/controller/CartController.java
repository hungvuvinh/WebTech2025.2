package com.webtech.backend.controller;

import com.webtech.backend.model.Cart;
import com.webtech.backend.model.CartItem;
import com.webtech.backend.repository.CartRepository;
import com.webtech.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController extends AbstractMongoCrudController<Cart> {

    private final CartRepository cartRepository;
    private final CartService cartService;

    @Override
    protected MongoRepository<Cart, String> repository() {
        return cartRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Cart";
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Cart> getByCustomerId(@PathVariable String customerId) {
        return cartService.findByCustomerId(customerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{customerId}/items")
    public ResponseEntity<Cart> addItem(@PathVariable String customerId, @RequestBody CartItem item) {
        Cart cart = cartService.addItem(customerId, item);
        return ResponseEntity.ok(cart);
    }
}
