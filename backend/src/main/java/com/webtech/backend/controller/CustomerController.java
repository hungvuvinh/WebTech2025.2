package com.webtech.backend.controller;

import com.webtech.backend.dto.CustomerUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.Customer;
import com.webtech.backend.repository.CustomerRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public List<Customer> list() {
        return customerRepository.findAll();
    }

    @GetMapping("/{id}")
    public Customer get(@PathVariable String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + id));
    }

    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody CustomerUpsertRequest req) {
        Customer c = new Customer();
        c.setCustomerName(req.getCustomerName());
        c.setEmail(req.getEmail());
        c.setPhoneNumber(req.getPhoneNumber());
        Customer saved = customerRepository.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable String id, @Valid @RequestBody CustomerUpsertRequest req) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + id));
        c.setCustomerName(req.getCustomerName());
        c.setEmail(req.getEmail());
        c.setPhoneNumber(req.getPhoneNumber());
        return customerRepository.save(c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!customerRepository.existsById(id)) {
            throw new NotFoundException("Customer not found: " + id);
        }
        customerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

