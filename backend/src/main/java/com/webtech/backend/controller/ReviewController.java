package com.webtech.backend.controller;

import com.webtech.backend.model.Review;
import com.webtech.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController extends AbstractMongoCrudController<Review> {

    private final ReviewRepository reviewRepository;

    @Override
    protected MongoRepository<Review, String> repository() {
        return reviewRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Review";
    }
}
