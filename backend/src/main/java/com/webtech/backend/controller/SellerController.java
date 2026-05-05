package com.webtech.backend.controller;

import com.webtech.backend.model.Seller;
import com.webtech.backend.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sellers")
@RequiredArgsConstructor
public class SellerController extends AbstractMongoCrudController<Seller> {

    private final SellerRepository sellerRepository;

    @Override
    protected MongoRepository<Seller, String> repository() {
        return sellerRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Seller";
    }
}
