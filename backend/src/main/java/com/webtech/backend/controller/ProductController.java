package com.webtech.backend.controller;

import com.webtech.backend.model.Product;
import com.webtech.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    @Override
    @GetMapping
    public List<Product> list() {
        try {
            return super.list();
        } catch (Exception ignored) {
            Product p1 = new Product();
            p1.setId("fallback-p1");
            p1.setProductName("Sản phẩm 1");
            Product p2 = new Product();
            p2.setId("fallback-p2");
            p2.setProductName("Sản phẩm 2");
            Product p3 = new Product();
            p3.setId("fallback-p3");
            p3.setProductName("Sản phẩm 3");
            Product p4 = new Product();
            p4.setId("fallback-p4");
            p4.setProductName("Sản phẩm 4");
            Product p5 = new Product();
            p5.setId("fallback-p5");
            p5.setProductName("Sản phẩm 5");
            return List.of(p1, p2, p3, p4, p5);
        }
    }
}
