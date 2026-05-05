package com.webtech.backend.controller;

import com.webtech.backend.model.Category;
import com.webtech.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController extends AbstractMongoCrudController<Category> {

    private final CategoryRepository categoryRepository;

    @Override
    protected MongoRepository<Category, String> repository() {
        return categoryRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Category";
    }
}
