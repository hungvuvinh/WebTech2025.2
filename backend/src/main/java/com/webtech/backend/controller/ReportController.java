package com.webtech.backend.controller;

import com.webtech.backend.dto.ReportUpsertRequest;
import com.webtech.backend.exception.NotFoundException;
import com.webtech.backend.model.Report;
import com.webtech.backend.repository.ReportRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportRepository reportRepository;

    public ReportController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping
    public List<Report> list() {
        return reportRepository.findAll();
    }

    @GetMapping("/{id}")
    public Report get(@PathVariable String id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Report not found: " + id));
    }

    @PostMapping
    public ResponseEntity<Report> create(@Valid @RequestBody ReportUpsertRequest req) {
        Report r = new Report();
        r.setData(req.getData());
        Report saved = reportRepository.save(r);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Report update(@PathVariable String id, @Valid @RequestBody ReportUpsertRequest req) {
        Report r = reportRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Report not found: " + id));
        r.setData(req.getData());
        return reportRepository.save(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!reportRepository.existsById(id)) {
            throw new NotFoundException("Report not found: " + id);
        }
        reportRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

