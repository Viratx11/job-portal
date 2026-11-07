package com.virat.job.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.virat.job.dto.response.JobMatchResponse;
import com.virat.job.service.SearchAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ai/vector")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VectorMatchController {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/match-score")
    public ResponseEntity<Object> calculateVectorMatch(@RequestBody Map<String, String> request) {
        String jobDescription = request.getOrDefault("jobDescription", "");
        String resumeText = request.getOrDefault("resumeText", "");

        if (jobDescription.isBlank() && resumeText.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "jobDescription and resumeText are required"));
        }

        JobMatchResponse match = SearchAiService.computeUnifiedJobMatch(
                jobDescription,
                List.of(),
                List.of(),
                resumeText
        );

        return ResponseEntity.ok(Map.of(
                "matchScore", match.getMatchScore(),
                "similarityIndex", match.getMatchScore() / 100.0,
                "summary", match.getSummary()
        ));
    }

    @KafkaListener(topics = "job-events-topic", groupId = "ai-worker-group")
    public void consumeOutboxEvent(String payload) {
        try {
            log.info("Received Outbox Event from Kafka [job-events-topic]: {}", payload);
            JsonNode node = objectMapper.readTree(payload);

            Long appId = node.has("applicationId") ? node.get("applicationId").asLong() : null;
            Long resumeId = node.has("resumeId") && node.get("resumeId").asLong() > 0
                    ? node.get("resumeId").asLong()
                    : null;

            String jobTitle = "Software Engineer";
            List<String> jobSkills = new ArrayList<>();
            List<String> candidateSkills = new ArrayList<>();
            StringBuilder fullResumeText = new StringBuilder(
                    node.has("resumeText") ? node.get("resumeText").asText() : ""
            );

            if (appId != null) {
                try {
                    Map<String, Object> appRow = jdbcTemplate.queryForMap(
                            "SELECT job_id, resume_id FROM applications WHERE id = ?",
                            appId
                    );
                    Long jobId = appRow.get("job_id") != null ? ((Number) appRow.get("job_id")).longValue() : null;
                    if (resumeId == null && appRow.get("resume_id") != null) {
                        resumeId = ((Number) appRow.get("resume_id")).longValue();
                    }
                    if (jobId != null) {
                        try {
                            String fetchedTitle = jdbcTemplate.queryForObject(
                                    "SELECT title FROM jobs WHERE id = ?",
                                    String.class,
                                    jobId
                            );
                            if (fetchedTitle != null) jobTitle = fetchedTitle;
                        } catch (Exception ignored) {
                        }
                        try {
                            List<String> fetchedJobSkills = jdbcTemplate.queryForList(
                                    "SELECT s.name FROM job_skills s JOIN job_skill_mapping m ON s.id = m.skill_id WHERE m.job_id = ?",
                                    String.class,
                                    jobId
                            );
                            if (fetchedJobSkills != null) jobSkills.addAll(fetchedJobSkills);
                        } catch (Exception ignored) {
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            if (resumeId != null && resumeId > 0) {
                try {
                    List<String> skills = jdbcTemplate.queryForList(
                            "SELECT skill_name FROM resume_skills WHERE resume_id = ?",
                            String.class,
                            resumeId
                    );
                    if (skills != null) candidateSkills.addAll(skills);
                } catch (Exception ignored) {
                }
                try {
                    List<String> projTechs = jdbcTemplate.queryForList(
                            "SELECT pt.technology FROM project_technologies pt JOIN projects p ON pt.project_id = p.id WHERE p.resume_id = ? AND pt.technology IS NOT NULL",
                            String.class,
                            resumeId
                    );
                    if (projTechs != null) {
                        for (String pt : projTechs) {
                            if (pt != null && !pt.trim().isEmpty()) {
                                candidateSkills.add(pt.trim());
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
                try {
                    String dbSummary = jdbcTemplate.queryForObject(
                            "SELECT summary FROM resumes WHERE id = ?",
                            String.class,
                            resumeId
                    );
                    if (dbSummary != null && !dbSummary.isBlank()) {
                        fullResumeText.append("\n").append(dbSummary);
                    }
                } catch (Exception ignored) {
                }
            }

            // Use the exact same unified fit score formula as Candidate "Check Resume Fit" and Recruiter "Screen Resume Fit"
            JobMatchResponse unified = SearchAiService.computeUnifiedJobMatch(
                    jobTitle,
                    jobSkills,
                    candidateSkills,
                    fullResumeText.toString()
            );

            int matchScorePercent = unified.getMatchScore();
            String shortlistStatus = matchScorePercent >= 80
                    ? "AUTO_SHORTLISTED"
                    : matchScorePercent >= 60 ? "REVIEW_RECOMMENDED" : "LOW_MATCH";
            String summary = unified.getSummary();

            log.info("Auto-computed Unified Fit Score for Outbox Event: {}%", matchScorePercent);

            if (appId != null) {
                jdbcTemplate.update(
                        "UPDATE applications SET ai_score = ?, ai_shortlist_status = ? WHERE id = ?",
                        matchScorePercent, shortlistStatus, appId
                );

                int updatedRows = jdbcTemplate.update(
                        "UPDATE application_screenings SET overall_score = ?, skills_match_score = ?, shortlist_status = ?, summary = ?, is_stale = false, screened_at = NOW() WHERE application_id = ?",
                        matchScorePercent, matchScorePercent, shortlistStatus, summary, appId
                );

                if (updatedRows == 0) {
                    jdbcTemplate.update(
                            "INSERT INTO application_screenings (application_id, overall_score, skills_match_score, experience_match_score, shortlist_status, summary, is_stale, screened_at, screening_version) VALUES (?, ?, ?, ?, ?, ?, false, NOW(), 'v1')",
                            appId, matchScorePercent, matchScorePercent, matchScorePercent, shortlistStatus, summary
                    );
                }

                log.info("Saved unified ai_score = {}% to PostgreSQL applications & application_screenings for application ID {}", matchScorePercent, appId);
            }
        } catch (Exception e) {
            log.error("Failed to process Outbox Kafka event in AI Worker", e);
        }
    }
}
