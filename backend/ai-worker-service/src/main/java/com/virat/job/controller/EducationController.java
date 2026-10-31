package com.virat.job.controller;

import com.virat.job.dto.request.AddEducationRequest;
import com.virat.job.dto.response.EducationResponse;
import com.virat.job.service.EducationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/educations")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @PostMapping
    public ResponseEntity<EducationResponse> add(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddEducationRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(educationService.addEducation(resumeId, candidateId, req));
    }

    @GetMapping
    public ResponseEntity<List<EducationResponse>> getAll(
            @PathVariable Long resumeId) throws Exception {
        return ResponseEntity.ok(educationService.getEducations(resumeId));
    }

    @PutMapping("/{educationId}")
    public ResponseEntity<EducationResponse> update(
            @PathVariable Long resumeId,
            @PathVariable Long educationId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddEducationRequest req) throws Exception {
        return ResponseEntity.ok(educationService.updateEducation(resumeId, educationId, candidateId, req));
    }

    @DeleteMapping("/{educationId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long resumeId,
            @PathVariable Long educationId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        educationService.deleteEducation(resumeId, educationId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
