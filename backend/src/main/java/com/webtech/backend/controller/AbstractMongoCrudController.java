package com.webtech.backend.controller;

import com.webtech.backend.exception.ResourceNotFoundException;
import com.webtech.backend.model.MongoDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public abstract class AbstractMongoCrudController<T extends MongoDocument> {

    protected abstract MongoRepository<T, String> repository();

    protected abstract String resourceLabel();

    @GetMapping
    public List<T> list() {
        return repository().findAll();
    }

    @GetMapping("/{id}")
    public T getById(@PathVariable String id) {
        return repository().findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(resourceLabel(), id));
    }

    @PostMapping
    public ResponseEntity<T> create(@RequestBody T body) {
        body.setId(null);
        T saved = repository().save(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public T replace(@PathVariable String id, @RequestBody T body) {
        if (!repository().existsById(id)) {
            throw new ResourceNotFoundException(resourceLabel(), id);
        }
        body.setId(id);
        return repository().save(body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository().existsById(id)) {
            throw new ResourceNotFoundException(resourceLabel(), id);
        }
        repository().deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
