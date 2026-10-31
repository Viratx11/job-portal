package com.virat.job.controller;

import com.virat.job.dto.request.CreateResumeRequest;
import com.virat.job.dto.request.UpdatePersonalInfoRequest;
import com.virat.job.dto.request.UpdateResumeRequest;
import com.virat.job.dto.response.ResumeResponse;
import com.virat.job.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping
    public ResponseEntity<ResumeResponse> createResume(
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody CreateResumeRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(resumeService.createResume(candidateId, req));
    }

    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            @RequestHeader("X-User-Id") Long candidateId) {
        return ResponseEntity.ok(resumeService.getMyResumes(candidateId));
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> getResume(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        return ResponseEntity.ok(resumeService.getResume(resumeId, candidateId));
    }

    @PutMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> updateResume(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody UpdateResumeRequest req) throws Exception {
        return ResponseEntity.ok(resumeService.updateResume(resumeId, candidateId, req));
    }

    @PutMapping("/{resumeId}/personal-info")
    public ResponseEntity<ResumeResponse> updatePersonalInfo(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody UpdatePersonalInfoRequest req) throws Exception {
        return ResponseEntity.ok(resumeService.updatePersonalInfo(resumeId, candidateId, req));
    }

    @PatchMapping("/{resumeId}/set-default")
    public ResponseEntity<ResumeResponse> setDefault(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        return ResponseEntity.ok(resumeService.setDefault(resumeId, candidateId));
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        resumeService.deleteResume(resumeId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
