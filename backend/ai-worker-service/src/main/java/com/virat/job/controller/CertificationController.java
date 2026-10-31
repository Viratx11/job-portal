package com.virat.job.controller;

import com.virat.job.dto.request.AddCertificationRequest;
import com.virat.job.dto.response.CertificationResponse;
import com.virat.job.service.CertificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService certificationService;

    @PostMapping
    public ResponseEntity<CertificationResponse> add(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddCertificationRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(certificationService.addCertification(resumeId, candidateId, req));
    }

    @GetMapping
    public ResponseEntity<List<CertificationResponse>> getAll(
            @PathVariable Long resumeId) throws Exception {
        return ResponseEntity.ok(certificationService.getCertifications(resumeId));
    }

    @PutMapping("/{certId}")
    public ResponseEntity<CertificationResponse> update(
            @PathVariable Long resumeId,
            @PathVariable Long certId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddCertificationRequest req) throws Exception {
        return ResponseEntity.ok(certificationService.updateCertification(resumeId, certId, candidateId, req));
    }

    @DeleteMapping("/{certId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long resumeId,
            @PathVariable Long certId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        certificationService.deleteCertification(resumeId, certId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
