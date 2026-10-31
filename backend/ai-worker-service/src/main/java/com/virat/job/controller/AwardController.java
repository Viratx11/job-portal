package com.virat.job.controller;

import com.virat.job.dto.request.AddAwardRequest;
import com.virat.job.dto.response.AwardResponse;
import com.virat.job.service.AwardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes/{resumeId}/awards")
@RequiredArgsConstructor
public class AwardController {

    private final AwardService awardService;

    @PostMapping
    public ResponseEntity<AwardResponse> add(
            @PathVariable Long resumeId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddAwardRequest req) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(awardService.addAward(resumeId, candidateId, req));
    }

    @GetMapping
    public ResponseEntity<List<AwardResponse>> getAll(
            @PathVariable Long resumeId) throws Exception {
        return ResponseEntity.ok(awardService.getAwards(resumeId));
    }

    @PutMapping("/{awardId}")
    public ResponseEntity<AwardResponse> update(
            @PathVariable Long resumeId,
            @PathVariable Long awardId,
            @RequestHeader("X-User-Id") Long candidateId,
            @Valid @RequestBody AddAwardRequest req) throws Exception {
        return ResponseEntity.ok(awardService.updateAward(resumeId, awardId, candidateId, req));
    }

    @DeleteMapping("/{awardId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long resumeId,
            @PathVariable Long awardId,
            @RequestHeader("X-User-Id") Long candidateId) throws Exception {
        awardService.deleteAward(resumeId, awardId, candidateId);
        return ResponseEntity.noContent().build();
    }
}
