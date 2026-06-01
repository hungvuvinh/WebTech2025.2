package com.webtech.backend.controller;

import com.webtech.backend.model.Product;
import com.webtech.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

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

    @GetMapping("/seller/{sellerId}")
    public List<Product> listBySeller(@PathVariable String sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    @Override
    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product body) {
        body.setId(null);
        if (body.getImgUrl() != null) {
            body.setImgUrl(normalizeCloudinaryUrl(body.getImgUrl()));
        }
        Product saved = productRepository.save(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Override
    @PutMapping("/{id}")
    public Product replace(@PathVariable String id, @RequestBody Product body) {
        if (!productRepository.existsById(id)) {
            throw new com.webtech.backend.exception.ResourceNotFoundException(resourceLabel(), id);
        }
        body.setId(id);
        if (body.getImgUrl() != null) {
            body.setImgUrl(normalizeCloudinaryUrl(body.getImgUrl()));
        }
        return productRepository.save(body);
    }

    private String normalizeCloudinaryUrl(String url) {
        if (url == null) return null;
        String lower = url.toLowerCase();
        if (!lower.contains("res.cloudinary.com")) return url;
        if (lower.contains("q_auto") || lower.contains("f_auto")) return url;
        int idx = url.indexOf("/upload/");
        if (idx == -1) return url;
        // insert transformations right after /upload/
        StringBuilder sb = new StringBuilder();
        sb.append(url, 0, idx + "/upload/".length());
        sb.append("q_auto,f_auto/");
        sb.append(url.substring(idx + "/upload/".length()));
        return sb.toString();
    }
}
