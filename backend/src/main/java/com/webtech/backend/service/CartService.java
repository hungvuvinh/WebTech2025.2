package com.webtech.backend.service;

import com.webtech.backend.exception.ResourceNotFoundException;
import com.webtech.backend.model.Cart;
import com.webtech.backend.model.CartItem;
import com.webtech.backend.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public List<Cart> findAll() {
        return cartRepository.findAll();
    }

    public Cart findById(String id) {
        return cartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", id));
    }

    public Optional<Cart> findByCustomerId(String customerId) {
        return cartRepository.findByCustomerId(customerId);
    }

    public Cart getOrCreateCart(String customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setCustomerId(customerId);
                    cart.setItem(new ArrayList<>());
                    return cartRepository.save(cart);
                });
    }

    public Cart addItem(String customerId, CartItem item) {
        Cart cart = getOrCreateCart(customerId);
        if (cart.getItem() == null) {
            cart.setItem(new ArrayList<>());
        }
        cart.getItem().add(item);
        return cartRepository.save(cart);
    }

    public Cart updateCart(String customerId, List<CartItem> items) {
        Cart cart = getOrCreateCart(customerId);
        cart.setItem(items);
        return cartRepository.save(cart);
    }

    public Cart clearCart(String customerId) {
        Cart cart = getOrCreateCart(customerId);
        cart.setItem(new ArrayList<>());
        return cartRepository.save(cart);
    }

    public void deleteCartByCustomerId(String customerId) {
        cartRepository.deleteByCustomerId(customerId);
    }

    public void delete(String id) {
        Cart cart = findById(id);
        cartRepository.delete(cart);
    }
}
