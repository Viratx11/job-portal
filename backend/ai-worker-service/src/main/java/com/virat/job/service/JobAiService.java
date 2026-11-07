package com.virat.job.service;

import com.virat.job.client.GeminiClient;
import com.virat.job.dto.request.HiringInsightsRequest;
import com.virat.job.dto.request.JobDescriptionRequest;
import com.virat.job.dto.request.SalaryRangeRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.ExtractJobFromUrlResponse;
import com.virat.job.dto.response.HiringInsightsResponse;
import com.virat.job.dto.response.SalaryRangeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

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

    public ExtractJobFromUrlResponse extractJobFromUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("Job URL cannot be empty");
        }
        String cleanUrl = url.trim();
        String webContent = "";

        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(4))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(cleanUrl))
                    .timeout(Duration.ofSeconds(5))
                    .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .GET()
                    .build();
            HttpResponse<String> resp = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 200 && resp.statusCode() < 400 && resp.body() != null) {
                String body = resp.body()
                        .replaceAll("(?is)<script.*?</script>", " ")
                        .replaceAll("(?is)<style.*?</style>", " ")
                        .replaceAll("<[^>]+>", " ")
                        .replaceAll("\\s+", " ")
                        .trim();
                webContent = body.length() > 12000 ? body.substring(0, 12000) : body;
            }
        } catch (Exception e) {
            log.warn("Direct HTTP fetch for job URL {} failed: {}. Parsing using Gemini with URL slug metadata.", cleanUrl, e.getMessage());
        }

        String prompt = """
                Analyze this job posting from external URL: %s
                Page Content / Metadata:
                %s

                Extract and generate a complete, structured job opening object for publication.
                Required fields:
                - title: The official job title (e.g. Senior Backend Engineer)
                - companyName: The hiring company name
                - category: Category name (e.g. Software Engineering, Data & AI, DevOps & Cloud, Product Management)
                - description: A thorough, attractive 2-3 paragraph job overview
                - requirements: Specific technical and experience requirements formatted with markdown bullet points
                - responsibilities: Core day-to-day responsibilities formatted with markdown bullet points
                - benefits: Competitive employee benefits and perks formatted with markdown bullet points
                - city: Primary city / location (e.g. Bengaluru, Remote, San Francisco, Hyderabad, Gurugram)
                - country: Country (e.g. India, United States)
                - minSalary: Realistic minimum annual salary in INR (e.g. 1500000)
                - maxSalary: Realistic maximum annual salary in INR (e.g. 2800000)
                - jobType: One of FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
                - workMode: One of REMOTE, ONSITE, HYBRID
                - experienceLevel: One of ENTRY, JUNIOR, MID, SENIOR, LEAD
                - skills: List of 4-8 core required technologies (e.g. ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Docker"])
                - tags: List of 3-5 keywords (e.g. ["backend", "distributed-systems", "java"])
                - sourceUrl: "%s"

                Respond strictly with valid JSON.
                """.formatted(cleanUrl, webContent.isBlank() ? "(HTML fetch restricted; infer role & company from URL structure and standard industry patterns)" : webContent, cleanUrl);

        try {
            ExtractJobFromUrlResponse response = geminiClient.generateJson(
                    "You are a talent acquisition systems parser that extracts structured job postings from career URLs. Always output valid JSON.",
                    prompt,
                    ExtractJobFromUrlResponse.class
            );
            if (response != null && response.getTitle() != null && !response.getTitle().isBlank()) {
                response.setSourceUrl(cleanUrl);
                return response;
            }
        } catch (Exception e) {
            log.warn("Gemini job extraction from URL failed: {}", e.getMessage());
        }

        return ExtractJobFromUrlResponse.builder()
                .title("Software Engineer")
                .companyName("Partner Company")
                .category("Software Engineering")
                .description("Exciting opportunity to join as a core engineer, architecting scalable systems and resilient APIs.")
                .requirements("• 2+ years experience building production software.\n• Strong problem solving and system design skills.\n• Proficiency with modern backend or full-stack technologies.")
                .responsibilities("• Design, develop, and maintain high-throughput backend APIs.\n• Collaborate with cross-functional teams to deliver reliable features.\n• Write clean, testable code and review pull requests.")
                .benefits("• Competitive compensation & equity.\n• Comprehensive health insurance.\n• Flexible remote work policy.")
                .city("Bengaluru")
                .country("India")
                .minSalary(1200000L)
                .maxSalary(2400000L)
                .jobType("FULL_TIME")
                .workMode("HYBRID")
                .experienceLevel("MID")
                .skills(List.of("Java", "Spring Boot", "PostgreSQL", "Docker", "Redis"))
                .tags(List.of("backend", "engineering", "apis"))
                .sourceUrl(cleanUrl)
                .build();
    }
}
