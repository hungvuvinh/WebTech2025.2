package com.webtech.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webtech.backend.exception.ResourceNotFoundException;
import com.webtech.backend.model.MongoDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

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

    @PatchMapping("/{id}")
    public T patch(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        T existing = repository().findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(resourceLabel(), id));
        
        ObjectMapper mapper = new ObjectMapper();
        T updated = mapper.convertValue(mapper.convertValue(existing, Map.class), (Class<T>) existing.getClass());
        
        // Merge non-null fields from updates into existing
        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            if (entry.getValue() != null) {
                try {
                    var prop = existing.getClass().getDeclaredField(entry.getKey());
                    prop.setAccessible(true);
                    prop.set(updated, entry.getValue());
                } catch (NoSuchFieldException | IllegalAccessException e) {
                    // Field not found or not accessible, skip
                }
            }
        }
        
        return repository().save(updated);
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
