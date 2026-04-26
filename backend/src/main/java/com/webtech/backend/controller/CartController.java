package com.webtech.backend.controller;

import com.webtech.backend.dto.CartUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.Cart;
import com.webtech.backend.repository.CartRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartRepository cartRepository;

    public CartController(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @GetMapping
    public List<Cart> list() {
        return cartRepository.findAll();
    }

    @GetMapping("/by-customer/{customerId}")
    public Cart getByCustomer(@PathVariable String customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new NotFoundException("Cart not found for customerId=" + customerId));
    }

    @GetMapping("/{id}")
    public Cart get(@PathVariable String id) {
        return cartRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cart not found: " + id));
    }

    @PostMapping
    public ResponseEntity<Cart> create(@Valid @RequestBody CartUpsertRequest req) {
        Cart c = new Cart();
        c.setCustomerId(req.getCustomerId());
        c.setItem(req.getItem());
        Cart saved = cartRepository.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Cart update(@PathVariable String id, @Valid @RequestBody CartUpsertRequest req) {
        Cart c = cartRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cart not found: " + id));
        c.setCustomerId(req.getCustomerId());
        c.setItem(req.getItem());
        return cartRepository.save(c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!cartRepository.existsById(id)) {
            throw new NotFoundException("Cart not found: " + id);
        }
        cartRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

