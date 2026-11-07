package com.virat.job.controller;

import com.virat.job.dto.request.CareerFeedbackRequest;
import com.virat.job.dto.request.CreateResumeFromLatexRequest;
import com.virat.job.dto.request.ExtractCertAiRequest;
import com.virat.job.dto.request.ExtractProjectAiRequest;
import com.virat.job.dto.request.FormatResumeAiRequest;
import com.virat.job.dto.request.ResumeImprovementRequest;
import com.virat.job.dto.request.ResumeParseRequest;
import com.virat.job.dto.request.ResumeSummaryRequest;
import com.virat.job.dto.request.WorkExperienceBulletRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.ApiResponse;
import com.virat.job.dto.response.CareerFeedbackResponse;
import com.virat.job.dto.response.ExtractCertAiResponse;
import com.virat.job.dto.response.ExtractProjectAiResponse;
import com.virat.job.dto.response.ResumeImprovementResponse;
import com.virat.job.dto.response.ResumeParseResponse;
import com.virat.job.dto.response.ResumeResponse;
import com.virat.job.dto.response.WorkExperienceBulletsResponse;
import com.virat.job.service.ResumeAiService;
import com.virat.job.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/resume")
@RequiredArgsConstructor
public class AiResumeController {

    private final ResumeAiService resumeAiService;
    private final ResumeService resumeService;

    @PostMapping("/extract-project")
    public ResponseEntity<ApiResponse<ExtractProjectAiResponse>> extractProject(
            @RequestBody ExtractProjectAiRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Project extracted successfully",
                resumeAiService.extractProjectFromUrl(request)));
    }

    @PostMapping("/extract-cert")
    public ResponseEntity<ApiResponse<ExtractCertAiResponse>> extractCert(
            @RequestBody ExtractCertAiRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Credential extracted successfully",
                resumeAiService.extractCertFromUrl(request)));
    }

    @PostMapping("/create-from-latex")
    public ResponseEntity<ApiResponse<ResumeResponse>> createFromLatex(
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId,
            @Valid @RequestBody CreateResumeFromLatexRequest request) throws Exception {
        Long resolvedId = candidateId != null ? candidateId : 1L;
        ResumeResponse resume = resumeService.createResumeFromLatex(resolvedId, request.getLatexCode(), request.getTitle());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume created, parsed, and compiled to PDF from LaTeX successfully", resume));
    }

    @PostMapping("/format-template")
    public ResponseEntity<ApiResponse<ResumeResponse>> formatTemplate(
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId,
            @Valid @RequestBody FormatResumeAiRequest request) throws Exception {
        Long resolvedId = candidateId != null ? candidateId : 1L;
        ResumeResponse resume = resumeService.formatResumeWithTemplate(request.getResumeId(), resolvedId, request);
        return ResponseEntity.ok(ApiResponse.success("Resume formatted and styled with template", resume));
    }

    @PostMapping("/summary")
    public ResponseEntity<ApiResponse<AiTextResponse>> generateSummary(
            @RequestBody ResumeSummaryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Professional summary generated",
                resumeAiService.generateProfessionalSummary(request)));
    }

    @PostMapping("/experience-bullets")
    public ResponseEntity<ApiResponse<WorkExperienceBulletsResponse>> generateBullets(
            @Valid @RequestBody WorkExperienceBulletRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Bullet points generated",
                resumeAiService.generateWorkExperienceBullets(request)));
    }

    @PostMapping("/parse")
    public ResponseEntity<ApiResponse<ResumeParseResponse>> parseResume(
            @Valid @RequestBody ResumeParseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Resume parsed successfully",
                resumeAiService.parseResume(request)));
    }

    @PostMapping("/improvements")
    public ResponseEntity<ApiResponse<ResumeImprovementResponse>> getImprovements(
            @Valid @RequestBody ResumeImprovementRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Resume improvements analyzed",
                resumeAiService.getResumeImprovementTips(request)));
    }

    @PostMapping("/career-feedback")
    public ResponseEntity<ApiResponse<CareerFeedbackResponse>> getCareerFeedback(
            @Valid @RequestBody CareerFeedbackRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Career feedback generated",
                resumeAiService.getCareerFeedback(request)));
    }
}
