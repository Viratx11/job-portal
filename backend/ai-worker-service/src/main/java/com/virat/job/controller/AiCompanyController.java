package com.virat.job.controller;

import com.virat.job.dto.request.CompanyDescriptionRequest;
import com.virat.job.dto.request.CompanyTaglineRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.ApiResponse;
import com.virat.job.dto.response.CompanyTaglineResponse;
import com.virat.job.service.CompanyAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/company")
@RequiredArgsConstructor
public class AiCompanyController {

    private final CompanyAiService companyAiService;

    @PostMapping("/describe")
    public ResponseEntity<ApiResponse<AiTextResponse>> generateCompanyDescription(
            @Valid @RequestBody CompanyDescriptionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Company description generated",
                companyAiService.generateCompanyDescription(request)));
    }

    @PostMapping("/taglines")
    public ResponseEntity<ApiResponse<CompanyTaglineResponse>> generateTaglines(
            @Valid @RequestBody CompanyTaglineRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Taglines generated",
                companyAiService.generateCompanyTaglines(request)));
    }
}
