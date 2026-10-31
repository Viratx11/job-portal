package com.virat.job.controller;

import com.virat.job.dto.request.ParseResumeRequest;
import com.virat.job.dto.response.ResumeParseJobResponse;
import com.virat.job.service.ResumeParseJobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes/parse-jobs")
@RequiredArgsConstructor
public class ResumeParseJobController {

    private final ResumeParseJobService parseJobService;

    @PostMapping
    public ResponseEntity<ResumeParseJobResponse> createParseJob(
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody ParseResumeRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(parseJobService.createParseJob(candidateId, req));
    }

    @GetMapping
    public ResponseEntity<List<ResumeParseJobResponse>> getMyParseJobs(
            @RequestHeader("X-User-Id") Long candidateId) {
        return ResponseEntity.ok(parseJobService.getMyParseJobs(candidateId));
    }

    @GetMapping("/{parseJobId}")
    public ResponseEntity<ResumeParseJobResponse> getParseJob(
            @PathVariable Long parseJobId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        return ResponseEntity.ok(parseJobService.getParseJob(parseJobId, candidateId));
    }
}
