package com.webtech.backend.controller;

import com.webtech.backend.model.Review;
import com.webtech.backend.repository.ReviewRepository;
import com.webtech.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController extends AbstractMongoCrudController<Review> {

    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;

    @Override
    protected MongoRepository<Review, String> repository() {
        return reviewRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Review";
    }

    @PostMapping
    public ResponseEntity<Review> create(@RequestBody Review body) {
        Review saved = reviewService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/product/{productId}")
    public List<Review> getByProductId(@PathVariable String productId) {
        return reviewService.findByProductId(productId);
    }

    @GetMapping("/customer/{customerId}")
    public List<Review> getByCustomerId(@PathVariable String customerId) {
        return reviewService.findByCustomerId(customerId);
    }

    @GetMapping("/product/{productId}/customer/{customerId}")
    public List<Review> getByProductAndCustomer(
            @PathVariable String productId,
            @PathVariable String customerId) {
        return reviewService.findByProductIdAndCustomerId(productId, customerId);
    }
}
