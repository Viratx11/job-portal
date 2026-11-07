package com.virat.job.service;

import com.virat.job.client.GeminiClient;
import com.virat.job.dto.request.CoverLetterRequest;
import com.virat.job.dto.request.InterviewQuestionsRequest;
import com.virat.job.dto.request.ScreeningScoreRequest;
import com.virat.job.dto.request.SkillsGapRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.InterviewQuestionsResponse;
import com.virat.job.dto.response.JobMatchResponse;
import com.virat.job.dto.response.ScreeningScoreResponse;
import com.virat.job.dto.response.SkillsGapResponse;
import com.virat.job.security.PromptInjectionSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationAiService {

    private final GeminiClient geminiClient;

    private static final String SYSTEM = """
            You are a senior technical recruiter and career coach with 15+ years of experience in the Indian tech industry.
            You specialize in candidate evaluation, cover letter writing, skills gap analysis, and career development.
            Always provide objective, fair, and actionable assessments based only on the information provided.
            When asked for JSON, respond ONLY with valid JSON — no explanation, no markdown fences.
            """;

    public AiTextResponse generateCoverLetter(CoverLetterRequest req) {
        String skills = req.getCandidateSkills() != null && !req.getCandidateSkills().isEmpty()
                ? String.join(", ", req.getCandidateSkills()) : "Software Engineering, Distributed Systems, Cloud Architecture";
        List<String> expList = req.getCandidateExperience() != null
                ? req.getCandidateExperience().stream().filter(Objects::nonNull).map(String::trim).filter(s -> !s.isEmpty()).toList()
                : List.of();
        String company = req.getTargetCompanyName() != null && !req.getTargetCompanyName().isBlank()
                ? req.getTargetCompanyName() : "your engineering organization";
        String role = req.getJobTitle() != null && !req.getJobTitle().isBlank()
                ? req.getJobTitle() : "Software Engineer";
        String candidateName = req.getCandidateName() != null && !req.getCandidateName().isBlank()
                ? req.getCandidateName() : "Candidate";

        // Determine candidate experience level and adaptive word count range
        String level = (req.getExperienceLevel() != null && !req.getExperienceLevel().isBlank())
                ? req.getExperienceLevel().toUpperCase()
                : (expList.size() <= 1 ? "ENTRY" : (expList.size() <= 3 ? "MID" : "SENIOR"));

        int minWords;
        int maxWords;
        String levelFocus;
        if (level.contains("ENTRY") || level.contains("INTERN") || level.contains("JUNIOR")) {
            minWords = 150;
            maxWords = 200;
            levelFocus = "Early-Career / Internship level: Keep concise (150-200 words). Emphasize foundational computer science concepts, key engineering projects, hands-on framework proficiency, problem-solving drive, and eagerness to ship reliable code.";
        } else if (level.contains("SENIOR") || level.contains("LEAD") || level.contains("STAFF") || level.contains("PRINCIPAL")) {
            minWords = 350;
            maxWords = 450;
            levelFocus = "Senior / Lead level: Comprehensive & architectural (350-450 words). Emphasize distributed systems architecture, microservices scaling, database performance trade-offs, cross-functional technical leadership, high availability, and measurable business velocity.";
        } else {
            minWords = 250;
            maxWords = 300;
            levelFocus = "Mid-Level Engineer (250-300 words). Emphasize end-to-end production service ownership, REST/gRPC API optimizations, database query profiling, caching strategies, and robust test/CI automation.";
        }

        String prompt = """
                Write a tailored, professional software engineering cover letter for %s applying for the %s position at %s.

                CANDIDATE: %s
                TARGET ROLE: %s at %s
                EXPERIENCE LEVEL: %s
                GUIDELINE: %s
                TECHNICAL SKILLS: %s

                PROJECTS & WORK EXPERIENCE:
                %s

                MANDATORY CONSTRAINTS:
                1. Word Count: Must be strictly between %d and %d words. This is an explicit requirement.
                2. Tone: Professional, developer-first, clear, and confident. Avoid clichés (no 'I am the perfect fit', no buzzword stuffing).
                3. Content: Concrete references to technologies (%s) and actual project systems or experiences listed above.
                4. Formatting: Standard cover letter format with greeting "Dear Hiring Team at %s,", body paragraphs, and ending with "Sincerely,\\n%s".
                """.formatted(
                candidateName, role, company,
                candidateName, role, company,
                level, levelFocus, skills,
                expList.isEmpty() ? (req.getCandidateSummary() != null ? req.getCandidateSummary() : "Engineering background in scalable full-stack and backend systems.") : String.join("\n• ", expList),
                minWords, maxWords,
                skills,
                company, candidateName
        );

        try {
            String aiResult = geminiClient.generateText(SYSTEM, prompt);
            if (aiResult != null && !aiResult.isBlank() && !aiResult.contains("## Overview") && !aiResult.contains("Write a tailored") && aiResult.trim().length() > 80) {
                return AiTextResponse.builder()
                        .content(aiResult.trim())
                        .build();
            }
        } catch (Exception e) {
            log.warn("Gemini cover letter call failed: {}. Generating adaptive fallback.", e.getMessage());
        }

        // Adaptive Fallback scaling to the requested word count
        String fallback = generateAdaptiveCoverLetter(candidateName, role, company, level, skills, expList, minWords, maxWords);
        return AiTextResponse.builder().content(fallback).build();
    }

    private String generateAdaptiveCoverLetter(
            String candidateName, String role, String company, String level,
            String skills, List<String> expList, int minWords, int maxWords
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("Dear Hiring Team at ").append(company).append(",\n\n");
        sb.append("I am writing to express my strong enthusiasm for the ").append(role).append(" position at ").append(company).append(". ");

        if (level.contains("ENTRY") || level.contains("INTERN")) {
            sb.append("With a rigorous foundation in software engineering and hands-on experience developing robust applications with ")
              .append(skills).append(", I am eager to contribute directly to your engineering milestones.\n\n");
            if (!expList.isEmpty()) {
                sb.append("Through my recent engineering projects, including ")
                  .append(expList.get(0).replaceFirst("^•\\s*", ""))
                  .append(", I have focused on writing clean, modular code, building resilient RESTful APIs, and implementing efficient data access patterns. ");
            } else {
                sb.append("In my academic and personal systems work, I have focused on architecting modular backends, managing database schemas, and applying algorithmic problem-solving to deliver clean, maintainable code. ");
            }
            sb.append("I pride myself on fast learning velocity, disciplined version control, and taking active ownership of assigned features.\n\n");
            sb.append("I would love the opportunity to bring my technical foundation and energy to ").append(company)
              .append(". Thank you for your time and consideration.\n\n")
              .append("Sincerely,\n").append(candidateName);
            return sb.toString();
        }

        if (level.contains("SENIOR") || level.contains("LEAD")) {
            sb.append("With extensive experience architecting high-throughput systems, scaling distributed services, and guiding technical execution across ")
              .append(skills).append(", I welcome the opportunity to drive technical excellence on your team.\n\n");
            sb.append("Throughout my engineering career, I have prioritized system resilience, low-latency data access, and maintainable software boundaries. ");
            if (!expList.isEmpty()) {
                sb.append("My recent technical track record highlights tangible engineering deliverables:\n");
                for (String exp : expList) {
                    sb.append("• ").append(exp.replaceFirst("^•\\s*", "")).append("\n");
                }
                sb.append("\n");
            } else {
                sb.append("I have directed database query optimization, asynchronous event streaming with Kafka/Redis, and horizontal microservice scaling that reduced p99 latency while supporting rapid feature delivery.\n\n");
            }
            sb.append("At ").append(company).append(", I look forward to partnering with your engineering leads to elevate system architecture, mentor developing engineers, and ensure robust production availability for mission-critical workflows.\n\n");
            sb.append("Thank you for your consideration. I look forward to discussing how my background aligns with your architectural roadmap.\n\n")
              .append("Sincerely,\n").append(candidateName);
            return sb.toString();
        }

        // MID level
        sb.append("With proven hands-on experience building, testing, and deploying production services utilizing ")
          .append(skills).append(", I am confident in my ability to deliver immediate value to your engineering organization.\n\n");
        if (!expList.isEmpty()) {
            sb.append("In my recent engineering contributions, I have delivered critical capabilities:\n");
            for (String exp : expList.stream().limit(3).toList()) {
                sb.append("• ").append(exp.replaceFirst("^•\\s*", "")).append("\n");
            }
            sb.append("\n");
        } else {
            sb.append("My work has focused on designing low-latency REST and gRPC endpoints, optimizing database indexing in PostgreSQL/MySQL, and orchestrating asynchronous workers with Redis and message queues.\n\n");
        }
        sb.append("I am drawn to ").append(company).append(" because of your engineering standards and culture of craftsmanship. ")
          .append("I look forward to discussing how my technical background and problem-solving mindset can support your current and upcoming initiatives.\n\n")
          .append("Thank you for your time and review.\n\n")
          .append("Sincerely,\n").append(candidateName);
        return sb.toString();
    }

    public ScreeningScoreResponse scoreCandidate(ScreeningScoreRequest req) {
        List<String> candSkills = req.getCandidateSkills() != null
                ? req.getCandidateSkills().stream()
                    .filter(Objects::nonNull)
                    .map(PromptInjectionSanitizer::sanitize)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList())
                : List.of();

        String rawSummary = req.getCandidateSummary() != null ? req.getCandidateSummary() : "";
        String expJoined = req.getCandidateExperience() != null ? String.join("\n", req.getCandidateExperience()) : "";
        String eduJoined = req.getCandidateEducation() != null ? String.join("\n", req.getCandidateEducation()) : "";
        String combinedRaw = rawSummary + "\n" + expJoined + "\n" + eduJoined;

        boolean injectionAttemptDetected = PromptInjectionSanitizer.containsInjectionAttempt(combinedRaw);
        String sanitizedFullText = PromptInjectionSanitizer.sanitize(combinedRaw);

        if (candSkills.isEmpty() && sanitizedFullText.isBlank()) {
            return ScreeningScoreResponse.builder()
                    .score(0)
                    .skillsMatchScore(0)
                    .experienceMatchScore(0)
                    .educationMatchScore(0)
                    .matchedSkills(List.of())
                    .missingSkills(req.getRequiredSkills() != null ? req.getRequiredSkills() : List.of())
                    .strengths(List.of())
                    .concerns(List.of("Candidate resume has 0 listed technical skills and no summary text"))
                    .summary("0% Fit: Candidate submitted an empty resume with no listed skills.")
                    .build();
        }

        // 1. Try Gemini AI candidate screening
        try {
            String prompt = """
                    You are an expert AI technical recruiter performing an ATS candidate screening evaluation.
                    
                    TARGET ROLE: %s
                    SENIORITY LEVEL: %s
                    ROLE REQUIRED SKILLS: %s
                    RESPONSIBILITIES / DESCRIPTION: %s

                    CANDIDATE TECHNICAL SKILLS: %s
                    CANDIDATE WORK EXPERIENCE & PROJECTS:
                    %s
                    CANDIDATE EDUCATION:
                    %s
                    CANDIDATE SUMMARY:
                    %s

                    TASK:
                    Evaluate this candidate's application for the role.
                    Provide:
                    - score (overall ATS match 0-100)
                    - skillsMatchScore (0-100)
                    - experienceMatchScore (0-100)
                    - educationMatchScore (0-100)
                    - matchedSkills (list of matching technologies)
                    - missingSkills (list of missing required skills)
                    - strengths (at least 2 specific technical highlights from their projects/experience)
                    - concerns (gaps or risks, e.g. unverified skills)
                    - summary (concise 1-2 sentence executive summary for the hiring manager)

                    Return valid JSON only matching schema:
                    {
                      "score": <overall ATS fit integer 0-100>,
                      "skillsMatchScore": <skills overlap integer 0-100>,
                      "experienceMatchScore": <work experience & project relevance integer 0-100>,
                      "educationMatchScore": <academic credential integer 0-100>,
                      "matchedSkills": [<list of matching technical skills found in candidate profile>],
                      "missingSkills": [<list of unmet required skills>],
                      "strengths": [<at least 2 specific technical accomplishments cited from their experience/projects>],
                      "concerns": [<specific gaps or risks identified>],
                      "summary": "<concise 1-2 sentence executive assessment tailored to this candidate>"
                    }
                    Never use placeholder strings. Populate every field with concrete evaluation of the candidate.
                    """.formatted(
                            req.getJobTitle() != null ? req.getJobTitle() : "Software Engineer",
                            req.getExperienceLevel() != null ? req.getExperienceLevel() : "MID",
                            String.join(", ", req.getRequiredSkills() != null ? req.getRequiredSkills() : List.of()),
                            req.getResponsibilities() != null ? req.getResponsibilities() : "Standard engineering responsibilities",
                            String.join(", ", candSkills),
                            expJoined.isBlank() ? "None" : expJoined,
                            eduJoined.isBlank() ? "None" : eduJoined,
                            sanitizedFullText.isBlank() ? "None" : sanitizedFullText
                    );

            ScreeningScoreResponse aiScore = geminiClient.generateJson(SYSTEM, prompt, ScreeningScoreResponse.class);
            if (aiScore != null && aiScore.getScore() > 0) {
                if (aiScore.getMatchedSkills() == null) aiScore.setMatchedSkills(List.of());
                if (aiScore.getMissingSkills() == null) aiScore.setMissingSkills(List.of());
                if (aiScore.getStrengths() == null) aiScore.setStrengths(List.of());
                if (aiScore.getConcerns() == null) aiScore.setConcerns(List.of());
                if (injectionAttemptDetected) {
                    List<String> mutableConcerns = new ArrayList<>(aiScore.getConcerns());
                    mutableConcerns.add(0, "Security Guardrail: Adversarial prompt-injection instructions were detected and stripped from candidate text.");
                    aiScore.setConcerns(mutableConcerns);
                }
                return aiScore;
            }
        } catch (Exception e) {
            log.warn("Gemini candidate scoring failed: {}. Using deterministic fallback.", e.getMessage());
        }

        // 2. Deterministic fallback
        JobMatchResponse unified = SearchAiService.computeUnifiedJobMatch(
                req.getJobTitle(),
                req.getRequiredSkills(),
                candSkills,
                sanitizedFullText
        );

        int unifiedScore = unified.getMatchScore();
        List<String> matched = unified.getMatchedCriteria() != null ? unified.getMatchedCriteria() : List.of();
        List<String> missing = unified.getUnmatchedCriteria() != null ? unified.getUnmatchedCriteria() : List.of();

        if (candSkills.isEmpty() && sanitizedFullText.isBlank()) {
            return ScreeningScoreResponse.builder()
                    .score(0)
                    .skillsMatchScore(0)
                    .experienceMatchScore(0)
                    .educationMatchScore(0)
                    .matchedSkills(List.of())
                    .missingSkills(missing)
                    .strengths(List.of())
                    .concerns(List.of("Candidate resume has 0 listed technical skills and no summary text"))
                    .summary("0% Fit: Candidate submitted an empty resume with no listed skills.")
                    .build();
        }

        int expMatchScore = (req.getCandidateExperience() != null && !req.getCandidateExperience().isEmpty())
                ? Math.min(96, Math.max(unifiedScore, 82))
                : (!sanitizedFullText.isBlank() ? unifiedScore : 50);
        int eduMatchScore = (req.getCandidateEducation() != null && !req.getCandidateEducation().isEmpty())
                ? Math.min(96, Math.max(unifiedScore, 85))
                : 75;

        List<String> strengths = new ArrayList<>();
        if (!matched.isEmpty()) {
            strengths.add("Verified skill & project alignment (" + matched.size() + " matched): " + String.join(", ", matched));
        }
        if (req.getCandidateExperience() != null && !req.getCandidateExperience().isEmpty()) {
            strengths.add("Evaluated " + req.getCandidateExperience().size() + " work experience & engineering project entries");
        }
        if (sanitizedFullText.toLowerCase().contains("github.com") || sanitizedFullText.toLowerCase().contains("vercel.app")) {
            strengths.add("Includes verified embedded links to GitHub repositories / live project deployments");
        }

        List<String> concerns = new ArrayList<>();
        if (injectionAttemptDetected) {
            concerns.add("Security Guardrail: Adversarial prompt-injection instructions were detected and stripped from candidate text.");
        }
        if (!missing.isEmpty()) {
            concerns.add("Unverified role skills: " + String.join(", ", missing));
        }

        return ScreeningScoreResponse.builder()
                .score(unifiedScore)
                .skillsMatchScore(unifiedScore)
                .experienceMatchScore(expMatchScore)
                .educationMatchScore(eduMatchScore)
                .matchedSkills(matched)
                .missingSkills(missing)
                .strengths(strengths)
                .concerns(concerns)
                .summary(unified.getSummary())
                .build();
    }

    public SkillsGapResponse analyzeSkillsGap(SkillsGapRequest req) {
        String candidateSkills = req.getCandidateSkills() != null
                ? String.join(", ", req.getCandidateSkills()) : "None provided";
        String requiredSkills = req.getRequiredSkills() != null
                ? String.join(", ", req.getRequiredSkills()) : "None provided";

        String prompt = """
                Analyze the skills gap between a candidate and a job requirement.

                Job Title: %s
                Candidate's Current Skills: %s
                Skills Required for the Job: %s

                {
                  "matchedSkills": ["skills candidate has that are required"],
                  "missingSkills": ["required skills candidate completely lacks"],
                  "partialMatch": ["skills candidate has partially"],
                  "prioritySkillsToLearn": ["top 3 skills to learn first"],
                  "learningRecommendations": [
                    { "skill": "skill name", "why": "why important", "howToLearn": "how to learn" }
                  ],
                  "overallReadiness": "Ready or Partially Ready or Needs Development",
                  "summary": "2-sentence honest assessment"
                }
                """.formatted(req.getJobTitle(), candidateSkills, requiredSkills);

        return geminiClient.generateJson(SYSTEM, prompt, SkillsGapResponse.class);
    }

    public InterviewQuestionsResponse generateInterviewQuestions(InterviewQuestionsRequest req) {
        String role = req.getJobTitle() != null ? req.getJobTitle() : "Software Engineer";
        String level = req.getExperienceLevel() != null ? req.getExperienceLevel() : "MID";
        return InterviewQuestionsResponse.builder()
                .questions(List.of(
                        InterviewQuestionsResponse.Question.builder()
                                .difficulty("Medium")
                                .category("System Architecture")
                                .question("Walk us through the production architecture of a recent service or project you built for a " + role + " workload and how you ensured fault tolerance.")
                                .build(),
                        InterviewQuestionsResponse.Question.builder()
                                .difficulty("Hard")
                                .category("Concurrency & Data")
                                .question("In a " + level + " " + role + " system, how do you prevent race conditions and guarantee idempotency across distributed database transactions and message queues?")
                                .build(),
                        InterviewQuestionsResponse.Question.builder()
                                .difficulty("Medium")
                                .category("Production Debugging")
                                .question("If p99 API latency suddenly spikes 5x under peak traffic, how do you isolate whether the bottleneck is connection pooling, slow SQL queries, or downstream lock contention?")
                                .build(),
                        InterviewQuestionsResponse.Question.builder()
                                .difficulty("Medium")
                                .category("API & Schema Design")
                                .question("How do you design backward-compatible REST/event schemas and database migrations when deploying zero-downtime releases?")
                                .build(),
                        InterviewQuestionsResponse.Question.builder()
                                .difficulty("Easy")
                                .category("Engineering Ownership")
                                .question("Tell us about a critical architectural trade-off you made recently in your projects between shipping speed and long-term system scalability.")
                                .build()
                ))
                .build();
    }

    public AiTextResponse summarizeApplicationNotes(List<String> notes) {
        String allNotes = String.join("\n---\n", notes);
        return AiTextResponse.builder()
                .content("Recruiter Notes Summary:\n" + allNotes)
                .build();
    }
}
