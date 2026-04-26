package com.webtech.backend.controller;

import com.webtech.backend.dto.SellerUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.Seller;
import com.webtech.backend.repository.SellerRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    private final SellerRepository sellerRepository;

    public SellerController(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    @GetMapping
    public List<Seller> list() {
        return sellerRepository.findAll();
    }

    @GetMapping("/{id}")
    public Seller get(@PathVariable String id) {
        return sellerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Seller not found: " + id));
    }

    @PostMapping
    public ResponseEntity<Seller> create(@Valid @RequestBody SellerUpsertRequest req) {
        Seller s = new Seller();
        s.setSellerName(req.getSellerName());
        s.setEmail(req.getEmail());
        s.setPhoneNumber(req.getPhoneNumber());
        Seller saved = sellerRepository.save(s);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Seller update(@PathVariable String id, @Valid @RequestBody SellerUpsertRequest req) {
        Seller s = sellerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Seller not found: " + id));
        s.setSellerName(req.getSellerName());
        s.setEmail(req.getEmail());
        s.setPhoneNumber(req.getPhoneNumber());
        return sellerRepository.save(s);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!sellerRepository.existsById(id)) {
            throw new NotFoundException("Seller not found: " + id);
        }
        sellerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

