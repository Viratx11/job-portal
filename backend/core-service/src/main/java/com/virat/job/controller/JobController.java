package com.virat.job.controller;

import com.virat.job.dto.request.JobRequest;
import com.virat.job.dto.request.JobSearchRequest;
import com.virat.job.dto.response.JobResponse;
import com.virat.job.dto.response.JobSummaryResponse;
import com.virat.job.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // employer posts a job — employerId comes from X-User-Id header (set by API gateway / JWT filter)
    @PostMapping
    public ResponseEntity<JobResponse> createJob(@RequestHeader("X-User-Id") Long employerId,
                                                 @Valid @RequestBody JobRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(employerId, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<JobSummaryResponse> getJobSummaryById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(jobService.getJobSummaryById(id));
    }

    // public search with filters
    @GetMapping
    public ResponseEntity<List<JobResponse>> getJobs(@ModelAttribute JobSearchRequest req) {
        log.info("getting all jobs");
        return ResponseEntity.ok(jobService.getJobs(req));
    }

    // all jobs by company (public)
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobResponse>> getJobsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(jobService.getJobsByCompany(companyId));
    }

    // employer's own jobs
    @GetMapping("/my")
    public ResponseEntity<List<JobResponse>> getMyJobs(@RequestHeader("X-User-Id") Long employerId) {
        return ResponseEntity.ok(jobService.getJobsByEmployer(employerId));
    }

    // admin — all jobs
    @GetMapping("/admin")
    public ResponseEntity<List<JobResponse>> getAllJobsAdmin() {
        return ResponseEntity.ok(jobService.getAllJobsAdmin());
    }

    // jobs by category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<JobResponse>> getJobsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(jobService.getJobsByCategory(categoryId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(@PathVariable Long id,
                                                 @RequestHeader("X-User-Id") Long employerId,
                                                 @Valid @RequestBody JobRequest req) throws Exception {
        return ResponseEntity.ok(jobService.updateJob(id, employerId, req));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<JobResponse> publishJob(@PathVariable Long id,
                                                  @RequestHeader("X-User-Id") Long employerId) throws Exception {
        return ResponseEntity.ok(jobService.publishJob(id, employerId));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<JobResponse> closeJob(@PathVariable Long id,
                                                @RequestHeader("X-User-Id") Long employerId) throws Exception {
        return ResponseEntity.ok(jobService.closeJob(id, employerId));
    }

    // called internally by application-service when someone applies
    @PatchMapping("/{id}/increment-applications")
    public ResponseEntity<Void> incrementApplicationCount(@PathVariable Long id) throws Exception {
        jobService.incrementApplicationCount(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id,
                                          @RequestHeader("X-User-Id") Long employerId) throws Exception {
        jobService.deleteJob(id, employerId);
        return ResponseEntity.noContent().build();
    }
}
