package com.virat.job.controller;

import com.virat.job.dto.request.AddWorkExperienceRequest;
import com.virat.job.dto.response.WorkExperienceResponse;
import com.virat.job.service.WorkExperienceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/work-experiences")
@RequiredArgsConstructor
public class WorkExperienceController {

    private final WorkExperienceService workExperienceService;

    @PostMapping
    public ResponseEntity<WorkExperienceResponse> add(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddWorkExperienceRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workExperienceService.addWorkExperience(resumeId, candidateId, req));
    }

    @GetMapping
    public ResponseEntity<List<WorkExperienceResponse>> getAll(
            @PathVariable Long resumeId) throws Exception {
        return ResponseEntity.ok(workExperienceService.getWorkExperiences(resumeId));
    }

    @PutMapping("/{experienceId}")
    public ResponseEntity<WorkExperienceResponse> update(
            @PathVariable Long resumeId,
            @PathVariable Long experienceId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddWorkExperienceRequest req) throws Exception {
        return ResponseEntity.ok(workExperienceService.updateWorkExperience(resumeId, experienceId, candidateId, req));
    }

    @DeleteMapping("/{experienceId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long resumeId,
            @PathVariable Long experienceId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        workExperienceService.deleteWorkExperience(resumeId, experienceId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
