package com.webtech.backend.service;

import com.webtech.backend.model.Customer;
import com.webtech.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public Customer findById(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }

    public Customer create(Customer customer) {
        customer.setId(null);
        return customerRepository.save(customer);
    }

    public Customer update(String id, Customer customer) {
        Customer existingCustomer = findById(id);
        existingCustomer.setCustomerName(customer.getCustomerName());
        existingCustomer.setEmail(customer.getEmail());
        existingCustomer.setPhoneNumber(customer.getPhoneNumber());
        return customerRepository.save(existingCustomer);
    }

    public void delete(String id) {
        Customer existingCustomer = findById(id);
        customerRepository.delete(existingCustomer);
    }
}