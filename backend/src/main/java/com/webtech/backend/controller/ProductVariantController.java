package com.webtech.backend.controller;

import com.webtech.backend.dto.ProductVariantUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.ProductVariant;
import com.webtech.backend.repository.ProductVariantRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-variants")
public class ProductVariantController {

    private final ProductVariantRepository productVariantRepository;

    public ProductVariantController(ProductVariantRepository productVariantRepository) {
        this.productVariantRepository = productVariantRepository;
    }

    @GetMapping
    public List<ProductVariant> list(@RequestParam(value = "productId", required = false) String productId) {
        if (productId == null || productId.isBlank()) {
            return productVariantRepository.findAll();
        }
        return productVariantRepository.findByProductId(productId);
    }

    @GetMapping("/{id}")
    public ProductVariant get(@PathVariable String id) {
        return productVariantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ProductVariant not found: " + id));
    }

    @PostMapping
    public ResponseEntity<ProductVariant> create(@Valid @RequestBody ProductVariantUpsertRequest req) {
        ProductVariant v = new ProductVariant();
        v.setPrice(req.getPrice());
        v.setProductId(req.getProductId());
        v.setStockQuantity(req.getStockQuantity());
        v.setVariantName(req.getVariantName());
        ProductVariant saved = productVariantRepository.save(v);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ProductVariant update(@PathVariable String id, @Valid @RequestBody ProductVariantUpsertRequest req) {
        ProductVariant v = productVariantRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ProductVariant not found: " + id));
        v.setPrice(req.getPrice());
        v.setProductId(req.getProductId());
        v.setStockQuantity(req.getStockQuantity());
        v.setVariantName(req.getVariantName());
        return productVariantRepository.save(v);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!productVariantRepository.existsById(id)) {
            throw new NotFoundException("ProductVariant not found: " + id);
        }
        productVariantRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

