package com.webtech.backend.controller;

import com.webtech.backend.model.Product;
import com.webtech.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController extends AbstractMongoCrudController<Product> {

    private final ProductRepository productRepository;

    @Override
    protected MongoRepository<Product, String> repository() {
        return productRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Product";
    }
}
