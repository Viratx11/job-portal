package com.virat.job.controller;

import com.virat.job.dto.request.AddLanguageRequest;
import com.virat.job.dto.response.LanguageResponse;
import com.virat.job.service.LanguageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/languages")
@RequiredArgsConstructor
public class LanguageController {

    private final LanguageService languageService;

    @PostMapping
    public ResponseEntity<LanguageResponse> add(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddLanguageRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(languageService.addLanguage(resumeId, candidateId, req));
    }

    @GetMapping
    public ResponseEntity<List<LanguageResponse>> getAll(
            @PathVariable Long resumeId) throws Exception {
        return ResponseEntity.ok(languageService.getLanguages(resumeId));
    }

    @PutMapping("/{languageId}")
    public ResponseEntity<LanguageResponse> update(
            @PathVariable Long resumeId,
            @PathVariable Long languageId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddLanguageRequest req) throws Exception {
        return ResponseEntity.ok(languageService.updateLanguage(resumeId, languageId, candidateId, req));
    }

    @DeleteMapping("/{languageId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long resumeId,
            @PathVariable Long languageId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        languageService.deleteLanguage(resumeId, languageId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
