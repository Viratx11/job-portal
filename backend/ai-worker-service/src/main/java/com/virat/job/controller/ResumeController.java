package com.virat.job.controller;

import com.virat.job.dto.request.CreateResumeRequest;
import com.virat.job.dto.request.FormatResumeAiRequest;
import com.virat.job.dto.request.UpdatePersonalInfoRequest;
import com.virat.job.dto.request.UpdateResumeRequest;
import com.virat.job.dto.response.ResumeResponse;
import com.virat.job.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping
    public ResponseEntity<ResumeResponse> createResume(
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId,
            @Valid @RequestBody CreateResumeRequest req) throws Exception {
        Long resolvedId = candidateId != null ? candidateId : 1L;
        return ResponseEntity.status(HttpStatus.CREATED).body(resumeService.createResume(resolvedId, req));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) throws Exception {
        Long resolvedId = candidateId != null ? candidateId : 1L;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeService.uploadResumeFile(resolvedId, file, title));
    }

    @GetMapping("/{resumeId}/file")
    public ResponseEntity<byte[]> downloadResumeFile(
            @PathVariable Long resumeId,
            @RequestParam(value = "download", required = false, defaultValue = "false") boolean download) throws Exception {
        byte[] pdfBytes = resumeService.getOrGenerateResumePdfBytes(resumeId);
        String fileName = "Candidate_Resume_" + resumeId + ".pdf";
        try {
            var resume = resumeService.getResumeEntityById(resumeId);
            if (resume.getUploadedFileName() != null && !resume.getUploadedFileName().isBlank()) {
                fileName = resume.getUploadedFileName();
                if (!fileName.toLowerCase().endsWith(".pdf")) {
                    fileName = fileName + ".pdf";
                }
            }
        } catch (Exception ignored) {
        }
        String disposition = (download ? "attachment" : "inline") + "; filename=\"" + fileName + "\"";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(pdfBytes);
    }

    @GetMapping
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId) {
        if (candidateId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(resumeService.getMyResumes(candidateId));
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> getResume(
            @PathVariable Long resumeId,
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId) throws Exception {
        return ResponseEntity.ok(resumeService.getResume(resumeId, candidateId));
    }

    @PutMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> updateResume(
            @PathVariable Long resumeId,
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId,
            @Valid @RequestBody UpdateResumeRequest req) throws Exception {
        return ResponseEntity.ok(resumeService.updateResume(resumeId, candidateId != null ? candidateId : 1L, req));
    }

    @PutMapping("/{resumeId}/personal-info")
    public ResponseEntity<ResumeResponse> updatePersonalInfo(
            @PathVariable Long resumeId,
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId,
            @Valid @RequestBody UpdatePersonalInfoRequest req) throws Exception {
        return ResponseEntity.ok(resumeService.updatePersonalInfo(resumeId, candidateId != null ? candidateId : 1L, req));
    }

    @PatchMapping("/{resumeId}/set-default")
    public ResponseEntity<ResumeResponse> setDefault(
            @PathVariable Long resumeId,
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId) throws Exception {
        return ResponseEntity.ok(resumeService.setDefault(resumeId, candidateId != null ? candidateId : 1L));
    }

    @PostMapping("/{resumeId}/format-template")
    public ResponseEntity<ResumeResponse> formatTemplate(
            @PathVariable Long resumeId,
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId,
            @Valid @RequestBody FormatResumeAiRequest req) throws Exception {
        return ResponseEntity.ok(resumeService.formatResumeWithTemplate(resumeId, candidateId != null ? candidateId : 1L, req));
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable Long resumeId,
            @RequestHeader(value = "X-User-Id", required = false) Long candidateId) throws Exception {
        resumeService.deleteResume(resumeId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
