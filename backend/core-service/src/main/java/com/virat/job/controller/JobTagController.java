package com.virat.job.controller;

import com.virat.job.dto.request.JobTagRequest;
import com.virat.job.dto.response.JobTagResponse;
import com.virat.job.service.JobTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-tags")
@RequiredArgsConstructor
public class JobTagController {

    private final JobTagService tagService;

    @PostMapping
    public ResponseEntity<JobTagResponse> createTag(@Valid @RequestBody JobTagRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(tagService.createTag(req));
    }

    @GetMapping
    public ResponseEntity<List<JobTagResponse>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobTagResponse>> searchTags(@RequestParam String keyword) {
        return ResponseEntity.ok(tagService.searchTags(keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobTagResponse> getTagById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(tagService.getTagById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobTagResponse> updateTag(@PathVariable Long id,
                                                    @Valid @RequestBody JobTagRequest req) throws Exception {
        return ResponseEntity.ok(tagService.updateTag(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) throws Exception {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
