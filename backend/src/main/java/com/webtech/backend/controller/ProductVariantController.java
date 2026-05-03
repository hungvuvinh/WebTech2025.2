package com.webtech.backend.controller;

import com.webtech.backend.model.ProductVariant;
import com.webtech.backend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/product-variants")
@RequiredArgsConstructor
public class ProductVariantController extends AbstractMongoCrudController<ProductVariant> {

    private final ProductVariantRepository productVariantRepository;

    @Override
    protected MongoRepository<ProductVariant, String> repository() {
        return productVariantRepository;
    }

    @Override
    protected String resourceLabel() {
        return "ProductVariant";
    }
}
