package com.virat.job.controller;

import com.virat.job.dto.request.AddResumeSkillRequest;
import com.virat.job.dto.response.ResumeSkillResponse;
import com.virat.job.service.ResumeSkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/skills")
@RequiredArgsConstructor
public class ResumeSkillController {

    private final ResumeSkillService skillService;

    @PostMapping
    public ResponseEntity<ResumeSkillResponse> add(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddResumeSkillRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(skillService.addSkill(resumeId, candidateId, req));
    }

    @GetMapping
    public ResponseEntity<List<ResumeSkillResponse>> getAll(
            @PathVariable Long resumeId) throws Exception {
        return ResponseEntity.ok(skillService.getSkills(resumeId));
    }

    @PutMapping("/{skillId}")
    public ResponseEntity<ResumeSkillResponse> update(
            @PathVariable Long resumeId,
            @PathVariable Long skillId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddResumeSkillRequest req) throws Exception {
        return ResponseEntity.ok(skillService.updateSkill(resumeId, skillId, candidateId, req));
    }

    @DeleteMapping("/{skillId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long resumeId,
            @PathVariable Long skillId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        skillService.deleteSkill(resumeId, skillId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
