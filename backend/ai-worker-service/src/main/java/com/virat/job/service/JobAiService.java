package com.virat.job.service;

import com.virat.job.client.GeminiClient;
import com.virat.job.dto.request.HiringInsightsRequest;
import com.virat.job.dto.request.JobDescriptionRequest;
import com.virat.job.dto.request.SalaryRangeRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.HiringInsightsResponse;
import com.virat.job.dto.response.SalaryRangeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobAiService {

    private final GeminiClient geminiClient;

    private static final String SYSTEM = """
            You are a senior HR professional and technical recruiter with deep knowledge of the Indian job market (2025-2026).
            You specialize in writing job descriptions, compensation benchmarking, and talent acquisition.
            Always write in a professional, engaging, inclusive, and bias-free tone.
            When asked for JSON, respond ONLY with valid JSON — no explanation, no markdown fences.
            """;

    public AiTextResponse generateJobDescription(JobDescriptionRequest req) {
        String skills = req.getSkills() != null ? String.join(", ", req.getSkills()) : "Not specified";
        String prompt = """
                Write a comprehensive, engaging, and inclusive job description.

                Job Details:
                - Title: %s
                - Required Skills: %s
                - Experience Level: %s
                - Job Type: %s
                - Work Mode: %s
                - Category: %s
                - Additional Context: %s

                Format the response in clean markdown with EXACTLY these sections:
                ## About the Role
                ## Key Responsibilities
                ## Requirements
                ## Nice to Have
                ## What We Offer

                Do NOT include placeholder company names.
                """.formatted(
                req.getTitle(), skills,
                req.getExperienceLevel() != null ? req.getExperienceLevel() : "Not specified",
                req.getJobType() != null ? req.getJobType() : "Not specified",
                req.getWorkMode() != null ? req.getWorkMode() : "Not specified",
                req.getCategory() != null ? req.getCategory() : "Not specified",
                req.getAdditionalContext() != null ? req.getAdditionalContext() : "None"
        );

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }

    public AiTextResponse generateJobRequirements(String title, String category) {
        String prompt = """
                Generate professional job requirements and responsibilities for this role.

                Job Title: %s
                Category: %s

                Format in markdown:
                ## Responsibilities
                - [5 specific bullet points]

                ## Requirements
                - [5 specific bullet points]
                """.formatted(title, category != null ? category : "General");

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }

    public SalaryRangeResponse suggestSalaryRange(SalaryRangeRequest req) {
        String skills = req.getSkills() != null ? String.join(", ", req.getSkills()) : "Not specified";
        String prompt = """
                Provide a realistic and competitive salary range for this role.

                Role Details:
                - Job Title: %s
                - Required Skills: %s
                - Experience Level: %s
                - Job Type: %s
                - Location: %s

                {
                  "minSalary": 600000,
                  "maxSalary": 1200000,
                  "currency": "INR",
                  "period": "YEARLY",
                  "marketInsight": "Brief 1-2 sentence insight about this role's compensation in the Indian market"
                }

                minSalary and maxSalary must be numbers (not strings).
                """.formatted(
                req.getTitle(), skills,
                req.getExperienceLevel() != null ? req.getExperienceLevel() : "MID",
                req.getJobType() != null ? req.getJobType() : "FULL_TIME",
                req.getLocation() != null ? req.getLocation() : "India"
        );

        return geminiClient.generateJson(SYSTEM, prompt, SalaryRangeResponse.class);
    }

    public AiTextResponse generateJobResponsibilities(String title, String category) {
        String prompt = """
                Generate 6 specific, action-oriented job responsibilities for this role.

                Job Title: %s
                Category: %s

                Return ONLY a plain bullet list (no headings):
                - [responsibility 1]
                - [responsibility 2]
                """.formatted(title, category != null ? category : "General");

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }

    public AiTextResponse generateJobBenefits(String title, String category, String jobType) {
        String prompt = """
                Generate 6 competitive, attractive job benefits for this role.

                Job Title: %s
                Category: %s
                Job Type: %s

                Return ONLY a plain bullet list (no headings):
                - [benefit 1]
                - [benefit 2]
                """.formatted(title, category != null ? category : "General", jobType != null ? jobType : "Full-time");

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }

    public AiTextResponse recommendSkillsForJob(String jobTitle, String description) {
        String prompt = """
                Recommend the most relevant skills for this job posting.

                Job Title: %s
                Description: %s

                List 8-10 specific, relevant skills. Return a comma-separated list of skill names only.
                Example: Java, Spring Boot, PostgreSQL, Docker, REST APIs, Microservices
                """.formatted(jobTitle, description != null ? description : "");

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }

    public AiTextResponse recommendTagsForJob(String title, String description) {
        String prompt = """
                Recommend 8-10 relevant tags/keywords for this job posting that improve discoverability.

                Job Title: %s
                Description: %s

                Return ONLY a comma-separated list of short tag names (1-3 words each).
                """.formatted(title, description != null ? description : "");

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }
}
