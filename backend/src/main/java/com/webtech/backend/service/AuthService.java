package com.webtech.backend.service;

import com.webtech.backend.dto.AuthLoginRequest;
import com.webtech.backend.dto.AuthRegisterRequest;
import com.webtech.backend.dto.AuthResponse;
import com.webtech.backend.exception.ApiException;
import com.webtech.backend.model.AuthAccount;
import com.webtech.backend.model.Customer;
import com.webtech.backend.model.Seller;
import com.webtech.backend.repository.AuthAccountRepository;
import com.webtech.backend.repository.CustomerRepository;
import com.webtech.backend.repository.SellerRepository;
import com.webtech.backend.security.JwtService;
import org.bson.types.ObjectId;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;

@Service
public class AuthService {

    private final AuthAccountRepository authAccountRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AuthAccountRepository authAccountRepository,
            CustomerRepository customerRepository,
            SellerRepository sellerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.authAccountRepository = authAccountRepository;
        this.customerRepository = customerRepository;
        this.sellerRepository = sellerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(AuthRegisterRequest request) {
        String role = normalizeRole(request.getRole());
        String email = normalizeEmail(request.getEmail());
        String phoneNumber = normalizePhone(request.getPhoneNumber());
        String userName = request.getUserName().trim();

        ensureUnique(email, phoneNumber);

        String id = new ObjectId().toHexString();
        try {
            if ("customer".equals(role)) {
                Customer customer = new Customer();
                customer.setId(id);
                customer.setCustomerName(userName);
                customer.setEmail(email);
                customer.setPhoneNumber(phoneNumber);
                customerRepository.save(customer);
            } else {
                Seller seller = new Seller();
                seller.setId(id);
                seller.setSellerName(userName);
                seller.setEmail(email);
                seller.setPhoneNumber(phoneNumber);
                sellerRepository.save(seller);
            }

            AuthAccount account = new AuthAccount();
            account.setId(id);
            account.setRole(role);
            account.setUserName(userName);
            account.setEmail(email);
            account.setPhoneNumber(phoneNumber);
            account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            authAccountRepository.save(account);
            return toResponse(account);
        } catch (DuplicateKeyException ex) {
            customerRepository.deleteById(id);
            sellerRepository.deleteById(id);
            // Determine which field caused the conflict and return field-level errors when possible
            Map<String, String> errors = new java.util.LinkedHashMap<>();
            if (authAccountRepository.existsByEmail(email)) {
                errors.put("email", "Email đã được sử dụng");
            }
            if (authAccountRepository.existsByPhoneNumber(phoneNumber)) {
                errors.put("phone_number", "Số điện thoại đã được sử dụng");
            }
            if (errors.isEmpty()) {
                throw new ApiException(HttpStatus.CONFLICT, "Email hoặc số điện thoại đã được sử dụng");
            }
            throw new ApiException(HttpStatus.CONFLICT, "Validation failed", errors);
        } catch (RuntimeException ex) {
            customerRepository.deleteById(id);
            sellerRepository.deleteById(id);
            throw ex;
        }
    }

    public AuthResponse login(AuthLoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        AuthAccount account = authAccountRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));
        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
        }
        return toResponse(account);
    }

    private void ensureUnique(String email, String phoneNumber) {
        Map<String, String> errors = new java.util.LinkedHashMap<>();
        if (authAccountRepository.existsByEmail(email)) {
            errors.put("email", "Email đã được sử dụng");
        }
        if (authAccountRepository.existsByPhoneNumber(phoneNumber)) {
            errors.put("phone_number", "Số điện thoại đã được sử dụng");
        }
        if (!errors.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "Validation failed", errors);
        }
    }

    private String normalizeRole(String role) {
        if (role == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "role is required");
        }
        String normalized = role.trim().toLowerCase(Locale.ROOT);
        if (!"customer".equals(normalized) && !"seller".equals(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "role must be customer or seller");
        }
        return normalized;
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phoneNumber) {
        if (phoneNumber == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "phone_number is required");
        }
        return phoneNumber.trim();
    }

    private AuthResponse toResponse(AuthAccount account) {
        String token = jwtService.generateToken(account);
        return new AuthResponse(
                account.getRole(),
                account.getId(),
                account.getUserName(),
                account.getEmail(),
            account.getPhoneNumber(),
            token,
            "Bearer",
            jwtService.getExpirationMs() / 1000
        );
    }
}