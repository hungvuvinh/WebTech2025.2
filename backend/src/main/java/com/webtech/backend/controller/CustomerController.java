package com.webtech.backend.controller;

import com.webtech.backend.model.Customer;
import com.webtech.backend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController extends AbstractMongoCrudController<Customer> {

    private final CustomerRepository customerRepository;

    @Override
    protected MongoRepository<Customer, String> repository() {
        return customerRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Customer";
    }
}
