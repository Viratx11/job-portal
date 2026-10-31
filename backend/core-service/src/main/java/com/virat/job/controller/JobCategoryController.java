package com.virat.job.controller;

import com.virat.job.dto.request.JobCategoryRequest;
import com.virat.job.dto.response.JobCategoryResponse;
import com.virat.job.service.JobCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-categories")
@RequiredArgsConstructor
public class JobCategoryController {

    private final JobCategoryService categoryService;

    @PostMapping
    public ResponseEntity<JobCategoryResponse> createCategory(@Valid @RequestBody JobCategoryRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(req));
    }

    @GetMapping
    public ResponseEntity<List<JobCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/root")
    public ResponseEntity<List<JobCategoryResponse>> getRootCategories() {
        return ResponseEntity.ok(categoryService.getRootCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobCategoryResponse> getCategoryById(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<JobCategoryResponse> getCategoryBySlug(@PathVariable String slug) throws Exception {
        return ResponseEntity.ok(categoryService.getCategoryBySlug(slug));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobCategoryResponse> updateCategory(@PathVariable Long id,
                                                              @Valid @RequestBody JobCategoryRequest req) throws Exception {
        return ResponseEntity.ok(categoryService.updateCategory(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) throws Exception {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
