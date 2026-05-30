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

        for (CartItem existing : cart.getItem()) {
            if (sameCartLine(existing, item)) {
                int currentQuantity = existing.getQuantity() != null ? existing.getQuantity() : 0;
                int addedQuantity = item.getQuantity() != null ? item.getQuantity() : 0;
                existing.setQuantity(currentQuantity + addedQuantity);
                return cartRepository.save(cart);
            }
        }

        cart.getItem().add(item);
        return cartRepository.save(cart);
    }

    public Cart removeItem(String customerId, String productVariantId) {
        Cart cart = getOrCreateCart(customerId);
        List<CartItem> items = cart.getItem();
        if (items == null || items.isEmpty()) {
            return cart;
        }

        items.removeIf(item -> productVariantId.equals(item.getProductVariantId()));
        return cartRepository.save(cart);
    }

    public Cart updateItemQuantity(String customerId, String productVariantId, CartItem item) {
        Cart cart = getOrCreateCart(customerId);
        if (cart.getItem() == null) {
            cart.setItem(new ArrayList<>());
        }

        int quantity = item != null && item.getQuantity() != null ? item.getQuantity() : 0;
        if (quantity <= 0) {
            return removeItem(customerId, productVariantId);
        }

        for (CartItem current : cart.getItem()) {
            if (!productVariantId.equals(current.getProductVariantId())) {
                continue;
            }

            current.setQuantity(quantity);
            if (item != null && item.getProductId() != null) {
                current.setProductId(item.getProductId());
            }
            return cartRepository.save(cart);
        }

        CartItem newItem = new CartItem();
        newItem.setProductId(item != null ? item.getProductId() : null);
        newItem.setProductVariantId(productVariantId);
        newItem.setQuantity(quantity);
        cart.getItem().add(newItem);
        return cartRepository.save(cart);
    }

    public Cart removeItems(String customerId, List<CartItem> purchasedItems) {
        Cart cart = getOrCreateCart(customerId);
        List<CartItem> items = cart.getItem();
        if (items == null || items.isEmpty() || purchasedItems == null || purchasedItems.isEmpty()) {
            return cart;
        }

        for (CartItem purchased : purchasedItems) {
            int remaining = purchased.getQuantity() != null ? purchased.getQuantity() : 0;
            if (remaining <= 0) {
                continue;
            }

            for (int i = 0; i < items.size() && remaining > 0; i++) {
                CartItem current = items.get(i);
                if (!sameCartLine(current, purchased)) {
                    continue;
                }

                int currentQuantity = current.getQuantity() != null ? current.getQuantity() : 0;
                if (currentQuantity <= remaining) {
                    remaining -= currentQuantity;
                    items.remove(i);
                    i--;
                } else {
                    current.setQuantity(currentQuantity - remaining);
                    remaining = 0;
                }
            }
        }

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

    private boolean sameCartLine(CartItem left, CartItem right) {
        if (left == null || right == null) {
            return false;
        }

        return left.getProductVariantId() != null
                && left.getProductVariantId().equals(right.getProductVariantId())
                && (left.getProductId() == null ? right.getProductId() == null : left.getProductId().equals(right.getProductId()));
    }
}
