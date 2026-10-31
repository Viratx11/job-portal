package com.virat.job.service;

import com.virat.job.client.GeminiClient;
import com.virat.job.dto.request.CompanyDescriptionRequest;
import com.virat.job.dto.request.CompanyTaglineRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.CompanyTaglineResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyAiService {

    private final GeminiClient geminiClient;

    private static final String SYSTEM = """
            You are an expert employer branding copywriter specializing in company profiles for job portals.
            You write authentic, inspiring content that appeals to job seekers without corporate jargon.
            Write in a warm, human tone that reflects real company culture and values.
            When asked for JSON, respond ONLY with valid JSON — no explanation, no markdown fences.
            """;

    public AiTextResponse generateCompanyDescription(CompanyDescriptionRequest req) {
        String prompt = """
                Write a compelling and authentic company "About Us" description for a job portal profile.

                Company Details:
                - Name: %s
                - Industry: %s
                - Company Type: %s
                - Company Size: %s
                - Tagline: %s
                - Additional Context: %s

                Write 2-3 engaging paragraphs:
                1. What the company does and its mission/vision
                2. Culture, team environment, and values
                3. Growth opportunities and what makes it a great place to work

                Rules:
                - Maximum 200 words
                - Write in third person
                - Don't start with "We are" or "Our company"
                """.formatted(
                req.getName(),
                req.getIndustry() != null ? req.getIndustry() : "Technology",
                req.getCompanyType() != null ? req.getCompanyType() : "Startup",
                req.getSize() != null ? req.getSize() : "50-200 employees",
                req.getTagline() != null ? req.getTagline() : "Not provided",
                req.getAdditionalContext() != null ? req.getAdditionalContext() : "None"
        );

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }

    public CompanyTaglineResponse generateCompanyTaglines(CompanyTaglineRequest req) {
        String prompt = """
                Generate 3 short, memorable, and inspiring company taglines.

                Company Details:
                - Name: %s
                - Industry: %s
                - Description: %s

                Rules for each tagline:
                - Maximum 8 words
                - Must be unique and memorable
                - Avoid generic phrases like "We are the best"

                { "taglines": ["tagline 1", "tagline 2", "tagline 3"] }
                """.formatted(
                req.getName(),
                req.getIndustry() != null ? req.getIndustry() : "Technology",
                req.getDescription() != null ? req.getDescription() : "Not provided"
        );

        return geminiClient.generateJson(SYSTEM, prompt, CompanyTaglineResponse.class);
    }
}
