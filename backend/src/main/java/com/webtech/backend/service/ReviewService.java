package com.webtech.backend.service;

import com.webtech.backend.exception.BadRequestException;
import com.webtech.backend.exception.ResourceNotFoundException;
import com.webtech.backend.model.Review;
import com.webtech.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderService orderService;

    public ReviewService(ReviewRepository reviewRepository, OrderService orderService) {
        this.reviewRepository = reviewRepository;
        this.orderService = orderService;
    }

    public List<Review> findAll() {
        return reviewRepository.findAll();
    }

    public Review findById(String id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));
    }

    public List<Review> findByProductId(String productId) {
        return reviewRepository.findByProductId(productId);
    }

    public List<Review> findByCustomerId(String customerId) {
        return reviewRepository.findByCustomerId(customerId);
    }

    public List<Review> findByProductIdAndCustomerId(String productId, String customerId) {
        return reviewRepository.findByProductIdAndCustomerId(productId, customerId);
    }

    public Review create(Review review) {
        if (review.getProductId() == null || review.getCustomerId() == null) {
            throw new BadRequestException("product_id and customer_id are required");
        }
        ensurePurchased(review.getCustomerId(), review.getProductId());

        List<Review> existingReviews = reviewRepository.findByProductIdAndCustomerId(
                review.getProductId(), review.getCustomerId());
        if (!existingReviews.isEmpty()) {
            Review existingReview = existingReviews.get(0);
            if (review.getComment() != null) {
                existingReview.setComment(review.getComment());
            }
            if (review.getRating() != null) {
                existingReview.setRating(review.getRating());
            }
            if (review.getProductVariantId() != null) {
                existingReview.setProductVariantId(review.getProductVariantId());
            }
            return reviewRepository.save(existingReview);
        }

        if (review.getCreatedAt() == null) {
            review.setCreatedAt(Instant.now());
        }
        review.setId(null);
        return reviewRepository.save(review);
    }

    public Review update(String id, Review review) {
        Review existingReview = findById(id);
        ensurePurchased(existingReview.getCustomerId(), existingReview.getProductId());
        if (review.getComment() != null) {
            existingReview.setComment(review.getComment());
        }
        if (review.getRating() != null) {
            existingReview.setRating(review.getRating());
        }
        if (review.getProductId() != null) {
            existingReview.setProductId(review.getProductId());
        }
        if (review.getProductVariantId() != null) {
            existingReview.setProductVariantId(review.getProductVariantId());
        }
        return reviewRepository.save(existingReview);
    }

    private void ensurePurchased(String customerId, String productId) {
        if (!orderService.hasPurchasedProduct(customerId, productId)) {
            throw new BadRequestException("Bạn phải mua sản phẩm trước khi đánh giá");
        }
    }

    public void delete(String id) {
        Review review = findById(id);
        reviewRepository.delete(review);
    }
}
