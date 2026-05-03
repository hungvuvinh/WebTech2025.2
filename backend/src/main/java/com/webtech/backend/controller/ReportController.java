package com.webtech.backend.controller;

import com.webtech.backend.model.Report;
import com.webtech.backend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController extends AbstractMongoCrudController<Report> {

    private final ReportRepository reportRepository;

    @Override
    protected MongoRepository<Report, String> repository() {
        return reportRepository;
    }

    @Override
    protected String resourceLabel() {
        return "Report";
    }
}
