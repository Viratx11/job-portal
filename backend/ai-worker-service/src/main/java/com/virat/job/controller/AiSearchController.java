package com.virat.job.controller;

import com.virat.job.dto.request.JobAlertSuggestRequest;
import com.virat.job.dto.request.JobMatchRequest;
import com.virat.job.dto.request.SearchEnhanceRequest;
import com.virat.job.dto.response.ApiResponse;
import com.virat.job.dto.response.JobAlertSuggestResponse;
import com.virat.job.dto.response.JobMatchResponse;
import com.virat.job.dto.response.SearchEnhanceResponse;
import com.virat.job.service.SearchAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/search")
@RequiredArgsConstructor
public class AiSearchController {

    private final SearchAiService searchAiService;

    @PostMapping("/enhance")
    public ResponseEntity<ApiResponse<SearchEnhanceResponse>> enhanceSearch(
            @Valid @RequestBody SearchEnhanceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Search enhanced",
                searchAiService.enhanceSearch(request)));
    }

    @PostMapping("/job-match")
    public ResponseEntity<ApiResponse<JobMatchResponse>> calculateJobMatch(
            @RequestBody JobMatchRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Job match calculated",
                searchAiService.calculateJobMatch(request)));
    }

    @PostMapping("/alert-suggestion")
    public ResponseEntity<ApiResponse<JobAlertSuggestResponse>> suggestAlertCriteria(
            @RequestBody JobAlertSuggestRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Alert criteria suggested",
                searchAiService.suggestJobAlertCriteria(request)));
    }
}
