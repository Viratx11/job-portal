package com.virat.job.controller;

import com.virat.job.dto.request.ExtractJobFromUrlRequest;
import com.virat.job.dto.request.HiringInsightsRequest;
import com.virat.job.dto.request.JobDescriptionRequest;
import com.virat.job.dto.request.SalaryRangeRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.ApiResponse;
import com.virat.job.dto.response.ExtractJobFromUrlResponse;
import com.virat.job.dto.response.HiringInsightsResponse;
import com.virat.job.dto.response.SalaryRangeResponse;
import com.virat.job.service.JobAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/job")
@RequiredArgsConstructor
public class AiJobController {

    private final JobAiService jobAiService;

    @PostMapping("/describe")
    public ResponseEntity<ApiResponse<AiTextResponse>> generateJobDescription(
            @Valid @RequestBody JobDescriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Job description generated",
                jobAiService.generateJobDescription(request)));
    }

    @GetMapping("/requirements")
    public ResponseEntity<ApiResponse<AiTextResponse>> generateJobRequirements(
            @RequestParam String title,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(ApiResponse.success("Requirements generated",
                jobAiService.generateJobRequirements(title, category)));
    }

    @PostMapping("/salary-suggestion")
    public ResponseEntity<ApiResponse<SalaryRangeResponse>> suggestSalary(
            @Valid @RequestBody SalaryRangeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Salary range suggested",
                jobAiService.suggestSalaryRange(request)));
    }

    @GetMapping("/skills-recommendation")
    public ResponseEntity<ApiResponse<AiTextResponse>> recommendSkills(
            @RequestParam String title,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(ApiResponse.success("Skills recommended",
                jobAiService.recommendSkillsForJob(title, description)));
    }

    @GetMapping("/responsibilities")
    public ResponseEntity<ApiResponse<AiTextResponse>> generateResponsibilities(
            @RequestParam String title,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(ApiResponse.success("Responsibilities generated",
                jobAiService.generateJobResponsibilities(title, category)));
    }

    @GetMapping("/benefits")
    public ResponseEntity<ApiResponse<AiTextResponse>> generateBenefits(
            @RequestParam String title,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String jobType) {
        return ResponseEntity.ok(ApiResponse.success("Benefits generated",
                jobAiService.generateJobBenefits(title, category, jobType)));
    }

    @GetMapping("/tags-recommendation")
    public ResponseEntity<ApiResponse<AiTextResponse>> recommendTags(
            @RequestParam String title,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(ApiResponse.success("Tags recommended",
                jobAiService.recommendTagsForJob(title, description)));
    }

    @PostMapping("/extract-url")
    public ResponseEntity<ApiResponse<ExtractJobFromUrlResponse>> extractJobFromUrl(
            @Valid @RequestBody ExtractJobFromUrlRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Job details extracted from URL",
                jobAiService.extractJobFromUrl(request.getUrl())));
    }
}
