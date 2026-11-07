package com.virat.job.service;

import com.virat.job.client.GeminiClient;
import com.virat.job.dto.request.JobAlertSuggestRequest;
import com.virat.job.dto.request.JobMatchRequest;
import com.virat.job.dto.request.SearchEnhanceRequest;
import com.virat.job.dto.response.JobAlertSuggestResponse;
import com.virat.job.dto.response.JobMatchResponse;
import com.virat.job.dto.response.SearchEnhanceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchAiService {

    private final GeminiClient geminiClient;

    private static final String SYSTEM = """
            You are a job search expert and career advisor with deep knowledge of the Indian job market.
            You extract structured search criteria from natural language and provide data-driven career recommendations.
            Always use the exact enum values specified in the prompt — never invent new values.
            When asked for JSON, respond ONLY with valid JSON — no explanation, no markdown fences.
            """;

    public static final Set<String> GENERIC_ROLE_WORDS = Set.of(
            "backend", "frontend", "fullstack", "full-stack", "full stack",
            "engineer", "engineering", "developer", "development", "software",
            "senior", "junior", "lead", "staff", "principal", "intern", "internship",
            "specialist", "architect", "manager", "associate", "role", "position"
    );

    public static List<String> inferDomainSkillsForRole(String jobTitle) {
        String t = jobTitle != null ? jobTitle.toLowerCase() : "";
        if (t.contains("backend") || t.contains("java") || t.contains("spring") || t.contains("api") || t.contains("microservice") || t.contains("distributed")) {
            return List.of("Java", "Spring Boot", "PostgreSQL", "REST API", "Microservices", "Docker", "Redis", "SQL");
        }
        if (t.contains("frontend") || t.contains("react") || t.contains("ui") || t.contains("angular") || t.contains("vue")) {
            return List.of("React", "TypeScript", "JavaScript", "Tailwind CSS", "Next.js", "HTML", "CSS");
        }
        if (t.contains("devops") || t.contains("cloud") || t.contains("sre") || t.contains("platform") || t.contains("infra")) {
            return List.of("Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git");
        }
        if (t.contains("data") || t.contains("ai") || t.contains("ml") || t.contains("machine learning")) {
            return List.of("Python", "SQL", "Machine Learning", "PostgreSQL", "FastAPI", "XGBoost");
        }
        if (t.contains("web3") || t.contains("blockchain") || t.contains("smart contract") || t.contains("crypto") || t.contains("solidity")) {
            return List.of("Solidity", "Web3", "Rust", "TypeScript", "Node.js", "Go");
        }
        return List.of("Java", "Spring Boot", "React", "TypeScript", "PostgreSQL", "REST API", "Docker", "Git");
    }

    public SearchEnhanceResponse enhanceSearch(SearchEnhanceRequest req) {
        String prompt = """
                Extract structured job search criteria from this natural language query.

                User Query: "%s"

                Valid jobTypes: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
                Valid workModes: REMOTE, HYBRID, ON_SITE
                Valid experienceLevels: ENTRY, MID, SENIOR, LEAD, EXECUTIVE

                {
                  "keywords": ["keyword1", "keyword2"],
                  "locations": ["city1", "city2"],
                  "jobTypes": ["FULL_TIME"],
                  "workModes": ["REMOTE"],
                  "experienceLevels": ["ENTRY"],
                  "minSalary": null,
                  "skills": ["skill1", "skill2"]
                }

                Rules:
                - Only include fields that are mentioned or clearly implied
                - Use null for minSalary if not mentioned
                - Use empty arrays [] for fields not mentioned
                """.formatted(req.getQuery());

        return geminiClient.generateJson(SYSTEM, prompt, SearchEnhanceResponse.class);
    }

    public JobMatchResponse calculateJobMatch(JobMatchRequest req) {
        String jobTitle = req.getJobTitle() != null ? req.getJobTitle() : "Software Engineer";
        List<String> jobSkills = req.getJobSkills() != null && !req.getJobSkills().isEmpty()
                ? req.getJobSkills() : inferDomainSkillsForRole(jobTitle);
        List<String> candSkills = req.getCandidateSkills() != null ? req.getCandidateSkills() : List.of();
        String summary = req.getCandidateResumeSummary() != null ? req.getCandidateResumeSummary() : "";
        List<String> projects = req.getCandidateProjects() != null ? req.getCandidateProjects() : List.of();

        if (candSkills.isEmpty() && summary.isBlank()) {
            return JobMatchResponse.builder()
                    .matchScore(0)
                    .matchedCriteria(List.of())
                    .unmatchedCriteria(jobSkills)
                    .recommendation("Add Skills or Upload Resume")
                    .summary("0% Fit: Your selected resume has no technical skills listed yet. Upload your PDF resume or add skills in Resumes & CV.")
                    .build();
        }

        try {
            String prompt = """
                    You are an expert AI technical recruiter and ATS screening evaluator.
                    Perform a semantic evaluation of how well this candidate fits the target job position.

                    TARGET ROLE: %s
                    REQUIRED ROLE SKILLS: %s
                    CANDIDATE SKILLS: %s
                    CANDIDATE PROJECTS:
                    %s
                    CANDIDATE RESUME SUMMARY:
                    %s

                    TASK:
                    1. Evaluate framework equivalence and technical domain depth (e.g. Spring Boot implies Java, FastAPI implies Python, PyTorch/Ollama implies AI engineering).
                    2. Assign a matchScore between 0 and 100 reflecting genuine fit.
                    3. List matchedCriteria (skills verified in resume/projects).
                    4. List unmatchedCriteria (unmet role requirements).
                    5. Provide recommendation ("Strong Fit", "Good Fit", "Partial Fit", or "Low Skill Overlap").
                    6. Provide a concise 1-2 sentence summary explaining the AI fit rationale.

                    Return valid JSON only matching schema:
                    {
                      "matchScore": <integer 0-100 reflecting genuine semantic and technical fit>,
                      "matchedCriteria": [<list of exact matching skills found in candidate profile/projects>],
                      "unmatchedCriteria": [<list of target role skills candidate lacks>],
                      "recommendation": "<Strong Fit | Good Fit | Partial Fit | Low Skill Overlap>",
                      "summary": "<specific concise 1-2 sentence AI assessment referencing the candidate's actual projects and experience>"
                    }
                    Never use placeholder text. Populate every field with concrete analysis of the candidate's background against the target role.
                    """.formatted(
                            jobTitle,
                            String.join(", ", jobSkills),
                            String.join(", ", candSkills),
                            projects.isEmpty() ? "None specified" : String.join("\n• ", projects),
                            summary.isBlank() ? "None" : summary
                    );

            JobMatchResponse aiMatch = geminiClient.generateJson(SYSTEM, prompt, JobMatchResponse.class);
            if (aiMatch != null && aiMatch.getMatchScore() > 0) {
                if (aiMatch.getMatchedCriteria() == null) aiMatch.setMatchedCriteria(List.of());
                if (aiMatch.getUnmatchedCriteria() == null) aiMatch.setUnmatchedCriteria(List.of());
                return aiMatch;
            }
        } catch (Exception e) {
            log.warn("Gemini AI job match calculation failed: {}. Using deterministic fallback.", e.getMessage());
        }

        return computeUnifiedJobMatch(
                jobTitle,
                jobSkills,
                candSkills,
                summary
        );
    }

    /**
     * Unified deterministic matching engine shared by BOTH Candidate "Check Resume Fit"
     * and Recruiter "Screen Resume Fit" so scores and matched/unmatched criteria are 100% identical.
     */
    public static JobMatchResponse computeUnifiedJobMatch(
            String jobTitle,
            List<String> rawJobSkills,
            List<String> rawCandidateSkills,
            String candidateFullText
    ) {
        Set<String> mergedCandidateSkills = new LinkedHashSet<>();
        if (rawCandidateSkills != null) {
            for (String s : rawCandidateSkills) {
                if (s != null && !s.trim().isEmpty()) {
                    mergedCandidateSkills.add(s.trim());
                }
            }
        }
        if (candidateFullText != null && !candidateFullText.isBlank()) {
            mergedCandidateSkills.addAll(ResumeAiService.detectSkillsInText(candidateFullText));
        }
        List<String> candList = new ArrayList<>(mergedCandidateSkills);

        List<String> safeJobSkills = rawJobSkills != null ? rawJobSkills : List.of();
        List<String> jobList = safeJobSkills.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty() && !GENERIC_ROLE_WORDS.contains(s.toLowerCase()))
                .collect(Collectors.toList());

        if (jobList.isEmpty()) {
            jobList = inferDomainSkillsForRole(jobTitle);
        }

        if (candList.isEmpty()) {
            return JobMatchResponse.builder()
                    .matchScore(0)
                    .matchedCriteria(List.of())
                    .unmatchedCriteria(jobList)
                    .recommendation("Add Skills or Upload Resume")
                    .summary("0% Fit: Your selected resume has no technical skills listed yet. Upload your PDF resume or add skills in Resumes & CV.")
                    .build();
        }

        List<String> matched = new ArrayList<>();
        List<String> unmatched = new ArrayList<>();
        String fullTextLower = candidateFullText != null ? candidateFullText.toLowerCase() : "";

        for (String js : jobList) {
            boolean foundInSkills = candList.stream().anyMatch(cs -> isSkillMatch(cs, js));
            boolean foundInText = !fullTextLower.isEmpty() && fullTextLower.contains(js.toLowerCase());
            if (foundInSkills || foundInText) {
                matched.add(js);
            } else {
                unmatched.add(js);
            }
        }

        String titleLower = jobTitle != null ? jobTitle.toLowerCase() : "";
        List<String> bonusDomainSkills = candList.stream()
                .filter(cs -> matched.stream().noneMatch(m -> m.equalsIgnoreCase(cs)))
                .filter(cs -> isRelevantToRoleTitle(cs, titleLower))
                .limit(6)
                .collect(Collectors.toList());

        for (String bonus : bonusDomainSkills) {
            if (!matched.contains(bonus)) {
                matched.add(bonus);
            }
        }

        double baseRatio = (double) (jobList.size() - unmatched.size()) / Math.max(jobList.size(), 1);
        double bonusBoost = Math.min(0.24, bonusDomainSkills.size() * 0.045);
        int computedScore = (int) Math.round(Math.min(98.0, (baseRatio * 80.0) + (bonusBoost * 100.0) + (matched.isEmpty() ? 0 : 14)));

        if (matched.isEmpty()) {
            computedScore = 8;
        }

        String recommendation = computedScore >= 80
                ? "Strong Fit"
                : computedScore >= 60
                ? "Good Fit"
                : computedScore >= 35
                ? "Partial Fit"
                : "Low Skill Overlap";

        String roleLabel = jobTitle != null && !jobTitle.isBlank() ? jobTitle : "this role";
        String summary;
        if (unmatched.isEmpty()) {
            summary = "Excellent alignment (" + computedScore + "%): Resume and projects cover all core technical requirements (" + String.join(", ", matched) + ") for " + roleLabel + ".";
        } else if (!matched.isEmpty()) {
            summary = "Matched " + matched.size() + " relevant skills & project technologies (" + String.join(", ", matched) + ") for " + roleLabel + ". Unverified: " + String.join(", ", unmatched) + ".";
        } else {
            summary = "Resume lists [" + String.join(", ", candList) + "], whereas " + roleLabel + " expects [" + String.join(", ", jobList) + "].";
        }

        return JobMatchResponse.builder()
                .matchScore(computedScore)
                .matchedCriteria(matched)
                .unmatchedCriteria(unmatched)
                .recommendation(recommendation)
                .summary(summary)
                .build();
    }

    public static boolean isSkillMatch(String candidateSkill, String jobSkill) {
        String c = candidateSkill.toLowerCase().trim();
        String j = jobSkill.toLowerCase().trim();
        if (c.equals(j) || c.contains(j) || j.contains(c)) return true;

        if ((j.equals("sql") || j.equals("postgresql") || j.equals("mysql")) &&
                (c.contains("sql") || c.contains("postgres") || c.contains("mysql") || c.contains("hibernate"))) {
            return true;
        }
        if (j.contains("spring") && (c.contains("spring") || c.contains("hibernate") || c.equals("java"))) {
            return true;
        }
        if ((j.contains("microservice") || j.contains("rest")) &&
                (c.contains("spring boot") || c.contains("microservice") || c.contains("rest") || c.contains("kafka") || c.contains("bullmq") || c.contains("go") || c.contains("node") || c.contains("fastapi"))) {
            return true;
        }
        if (j.equals("javascript") && (c.equals("typescript") || c.contains("react") || c.contains("next.js") || c.contains("node"))) {
            return true;
        }
        if (j.equals("kafka") && (c.contains("kafka") || c.contains("bullmq") || c.contains("rabbitmq") || c.contains("redis"))) {
            return true;
        }
        return false;
    }

    public static boolean isRelevantToRoleTitle(String skill, String titleLower) {
        String s = skill.toLowerCase();
        if (titleLower.contains("backend") || titleLower.contains("java") || titleLower.contains("software") || titleLower.contains("distributed") || titleLower.contains("full")) {
            return Set.of("java", "spring boot", "spring security", "spring mvc", "spring data jpa", "hibernate",
                    "postgresql", "mysql", "mongodb", "redis", "kafka", "bullmq", "docker", "kubernetes", "aws",
                    "microservices", "rest api", "sql", "node.js", "python", "fastapi", "go", "golang", "rust",
                    "typescript", "next.js", "react", "git", "linux", "system design").contains(s);
        }
        if (titleLower.contains("frontend") || titleLower.contains("react") || titleLower.contains("ui")) {
            return Set.of("react", "typescript", "javascript", "next.js", "tailwind css", "html", "css", "redux").contains(s);
        }
        if (titleLower.contains("data") || titleLower.contains("ml") || titleLower.contains("ai")) {
            return Set.of("python", "sql", "postgresql", "fastapi", "xgboost", "streamlit", "power bi", "dax", "machine learning").contains(s);
        }
        return false;
    }

    public JobAlertSuggestResponse suggestJobAlertCriteria(JobAlertSuggestRequest req) {
        String skills = req.getSkills() != null ? String.join(", ", req.getSkills()) : "Not provided";
        String jobTitles = req.getPreviousJobTitles() != null
                ? String.join(", ", req.getPreviousJobTitles()) : "Not provided";
        String educations = req.getEducations() != null
                ? String.join("; ", req.getEducations()) : "Not provided";

        String prompt = """
                Based on this candidate's profile, suggest optimal job alert criteria.

                Candidate Profile:
                - Skills: %s
                - Experience Level: %s
                - Previous Job Titles: %s
                - Education: %s

                Valid jobTypes: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
                Valid workModes: REMOTE, HYBRID, ON_SITE
                Valid experienceLevels: ENTRY, MID, SENIOR, LEAD, EXECUTIVE

                {
                  "suggestedKeywords": ["keyword1"],
                  "suggestedLocations": ["city1"],
                  "suggestedJobTypes": ["FULL_TIME"],
                  "suggestedWorkModes": ["REMOTE", "HYBRID"],
                  "suggestedExperienceLevels": ["MID"],
                  "suggestedIndustries": ["Technology"],
                  "reasoning": "Brief explanation of why these criteria were chosen"
                }
                """.formatted(skills, req.getExperienceLevel(), jobTitles, educations);

        return geminiClient.generateJson(SYSTEM, prompt, JobAlertSuggestResponse.class);
    }
}
