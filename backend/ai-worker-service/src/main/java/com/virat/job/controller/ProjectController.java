package com.virat.job.controller;

import com.virat.job.dto.request.AddProjectRequest;
import com.virat.job.dto.response.ProjectResponse;
import com.virat.job.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> add(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddProjectRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.addProject(resumeId, candidateId, req));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAll(
            @PathVariable Long resumeId) throws Exception {
        return ResponseEntity.ok(projectService.getProjects(resumeId));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> update(
            @PathVariable Long resumeId,
            @PathVariable Long projectId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddProjectRequest req) throws Exception {
        return ResponseEntity.ok(projectService.updateProject(resumeId, projectId, candidateId, req));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long resumeId,
            @PathVariable Long projectId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        projectService.deleteProject(resumeId, projectId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
