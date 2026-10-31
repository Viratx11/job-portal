package com.virat.job.controller;

import com.virat.job.dto.request.CompanyApplicationFilterRequest;
import com.virat.job.dto.request.CreateApplicationRequest;
import com.virat.job.dto.request.UpdateApplicationStatusRequest;
import com.virat.job.dto.request.WithdrawApplicationRequest;
import com.virat.job.dto.response.ApiResponse;
import com.virat.job.dto.response.ApplicationResponse;
import com.virat.job.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationResponse> createApplication(
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody CreateApplicationRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.createApplication(candidateId, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getApplicationById(
            @PathVariable Long id) throws Exception {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @RequestHeader("X-User-Id") Long candidateId) {
        return ResponseEntity.ok(applicationService.getMyApplications(candidateId));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsForJob(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsForJob(jobId));
    }

    @GetMapping("/company")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsForCompany (
            @RequestHeader("X-User-Id") Long userId,
            @ModelAttribute CompanyApplicationFilterRequest filter) throws Exception{
        return ResponseEntity.ok(applicationService.getApplicationsForCompany(userId, filter));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long employerId,
            @Valid @RequestBody UpdateApplicationStatusRequest req) throws Exception {
        return ResponseEntity.ok(applicationService.updateStatus(id, employerId, req));
    }

    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<ApplicationResponse> withdraw(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long candidateId,
            @RequestBody WithdrawApplicationRequest req) throws Exception {
        return ResponseEntity.ok(applicationService.withdraw(id, candidateId, req));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApplicationResponse> markAsRead(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long employerId) throws Exception {
        return ResponseEntity.ok(applicationService.markAsRead(id, employerId));
    }

    @PatchMapping("/{id}/star")
    public ResponseEntity<ApplicationResponse> toggleStar(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long employerId) throws Exception {
        return ResponseEntity.ok(applicationService.toggleStar(id, employerId));
    }

    @PostMapping("/internal/jobs/{jobId}/mark-stale")
    public ResponseEntity<Void> markScreeningsStale(@PathVariable Long jobId) {
        applicationService.markScreeningsStaleForJob(jobId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteApplication(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        applicationService.deleteApplication(id, candidateId);
        return ResponseEntity.ok(new ApiResponse("Application deleted successfully", true));
    }
}
