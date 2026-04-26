package com.webtech.backend.controller;

import com.webtech.backend.dto.ReviewUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.Review;
import com.webtech.backend.repository.ReviewRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public List<Review> list(
            @RequestParam(value = "productId", required = false) String productId,
            @RequestParam(value = "customerId", required = false) String customerId
    ) {
        if (productId != null && !productId.isBlank()) {
            return reviewRepository.findByProductId(productId);
        }
        if (customerId != null && !customerId.isBlank()) {
            return reviewRepository.findByCustomerId(customerId);
        }
        return reviewRepository.findAll();
    }

    @GetMapping("/{id}")
    public Review get(@PathVariable String id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Review not found: " + id));
    }

    @PostMapping
    public ResponseEntity<Review> create(@Valid @RequestBody ReviewUpsertRequest req) {
        Review r = new Review();
        r.setComment(req.getComment());
        r.setCreatedAt(req.getCreatedAt() != null ? req.getCreatedAt() : new Date());
        r.setCustomerId(req.getCustomerId());
        r.setProductId(req.getProductId());
        r.setProductVariantId(req.getProductVariantId());
        r.setRating(req.getRating());
        Review saved = reviewRepository.save(r);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Review update(@PathVariable String id, @Valid @RequestBody ReviewUpsertRequest req) {
        Review r = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Review not found: " + id));
        r.setComment(req.getComment());
        r.setCreatedAt(req.getCreatedAt() != null ? req.getCreatedAt() : r.getCreatedAt());
        r.setCustomerId(req.getCustomerId());
        r.setProductId(req.getProductId());
        r.setProductVariantId(req.getProductVariantId());
        r.setRating(req.getRating());
        return reviewRepository.save(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!reviewRepository.existsById(id)) {
            throw new NotFoundException("Review not found: " + id);
        }
        reviewRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

