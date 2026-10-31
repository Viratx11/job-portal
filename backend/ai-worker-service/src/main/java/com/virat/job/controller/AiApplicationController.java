package com.virat.job.controller;

import com.virat.job.dto.request.BulkScreeningRequest;
import com.virat.job.dto.request.CoverLetterRequest;
import com.virat.job.dto.request.InterviewQuestionsRequest;
import com.virat.job.dto.request.ScreeningScoreRequest;
import com.virat.job.dto.request.SkillsGapRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.ApiResponse;
import com.virat.job.dto.response.BulkScreeningResponse;
import com.virat.job.dto.response.InterviewQuestionsResponse;
import com.virat.job.dto.response.ScreeningScoreResponse;
import com.virat.job.dto.response.SkillsGapResponse;
import com.virat.job.service.ApplicationAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/application")
@RequiredArgsConstructor
public class AiApplicationController {

    private final ApplicationAiService applicationAiService;

    @PostMapping("/cover-letter")
    public ResponseEntity<ApiResponse<AiTextResponse>> generateCoverLetter(
            @Valid @RequestBody CoverLetterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cover letter generated",
                applicationAiService.generateCoverLetter(request)));
    }

    @PostMapping("/screening-score")
    public ResponseEntity<ApiResponse<ScreeningScoreResponse>> scoreCandidate(
            @RequestBody ScreeningScoreRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Candidate screened",
                applicationAiService.scoreCandidate(request)));
    }

    @PostMapping("/skills-gap")
    public ResponseEntity<ApiResponse<SkillsGapResponse>> analyzeSkillsGap(
            @Valid @RequestBody SkillsGapRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Skills gap analyzed",
                applicationAiService.analyzeSkillsGap(request)));
    }

    @PostMapping("/interview-questions")
    public ResponseEntity<ApiResponse<InterviewQuestionsResponse>> generateInterviewQuestions(
            @Valid @RequestBody InterviewQuestionsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interview questions generated",
                applicationAiService.generateInterviewQuestions(request)));
    }

    @PostMapping("/summarize-notes")
    public ResponseEntity<ApiResponse<AiTextResponse>> summarizeNotes(
            @RequestBody List<String> notes) {
        return ResponseEntity.ok(ApiResponse.success("Notes summarized",
                applicationAiService.summarizeApplicationNotes(notes)));
    }
}
