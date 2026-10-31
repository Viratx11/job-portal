package com.virat.job.controller;

import com.virat.job.domain.CompanyStatus;
import com.virat.job.domain.CompanyType;
import com.virat.job.domain.IndustryType;
import com.virat.job.dto.request.CompanyRequest;
import com.virat.job.dto.response.CompanyResponse;
import com.virat.job.service.CompanyService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<CompanyResponse> createCompany(
            @RequestHeader("X-User-Id") Long ownerId,
            @RequestBody @Valid CompanyRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyService.createCompany(ownerId, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(
            @PathVariable Long id) throws Exception {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/summary/{id}")
    public ResponseEntity<CompanyResponse> getCompanySummaryById(
            @PathVariable Long id) throws Exception {
        return ResponseEntity.ok(companyService.getCompanySummaryById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<CompanyResponse> getMyCompany(
            @RequestHeader("X-User-Id") Long ownerId) throws Exception {
        return ResponseEntity.ok(companyService.getMyCompany(ownerId));
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllCompanies(
            @RequestParam(required = false) CompanyType companyType,
            @RequestParam(required = false) IndustryType industryType,
            @RequestParam(required = false) CompanyStatus status) {
        return ResponseEntity.ok(companyService.getAllCompanies(companyType, industryType, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> updateCompany(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long ownerId,
            @RequestBody @Valid CompanyRequest req)
            throws Exception {
        return ResponseEntity.ok(companyService.updateCompany(id, ownerId, req));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<CompanyResponse> verifyCompany(
            @PathVariable Long id) throws Exception {
        return ResponseEntity.ok(companyService.verifyCompany(id));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<CompanyResponse> deactivateCompany(
            @PathVariable Long id) throws Exception {
        return ResponseEntity.ok(companyService.deactivateCompany(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long ownerId)
            throws Exception {
        companyService.deleteCompany(id, ownerId);
        return ResponseEntity.noContent().build();
    }
}