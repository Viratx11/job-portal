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
        String candidateSkills = req.getCandidateSkills() != null
                ? String.join(", ", req.getCandidateSkills()) : "Not provided";
        String jobSkills = req.getJobSkills() != null
                ? String.join(", ", req.getJobSkills()) : "Not provided";
        String preferredWorkModes = req.getPreferredWorkModes() != null
                ? String.join(", ", req.getPreferredWorkModes()) : "Any";
        String preferredJobTypes = req.getPreferredJobTypes() != null
                ? String.join(", ", req.getPreferredJobTypes()) : "Any";

        String prompt = """
                Calculate how well this job matches the candidate's profile and preferences.

                Candidate Preferences:
                - Preferred Work Modes: %s
                - Preferred Job Types: %s
                - Minimum Salary: %s
                - Experience Level: %s
                - Skills: %s

                Job Details:
                - Title: %s
                - Work Mode: %s
                - Job Type: %s
                - Salary Range: %s - %s %s
                - Experience Required: %s
                - Required Skills: %s

                {
                  "matchScore": 85,
                  "matchedCriteria": ["criteria1"],
                  "unmatchedCriteria": ["criteria2"],
                  "recommendation": "Highly Recommended or Recommended or Partial Match or Not Recommended",
                  "summary": "2-sentence explanation"
                }
                """.formatted(
                preferredWorkModes, preferredJobTypes,
                req.getMinSalary() != null ? req.getMinSalary() + " INR/year" : "Not specified",
                req.getCandidateExperienceLevel() != null ? req.getCandidateExperienceLevel() : "Not specified",
                candidateSkills,
                req.getJobTitle() != null ? req.getJobTitle() : "Not specified",
                req.getWorkMode() != null ? req.getWorkMode() : "Not specified",
                req.getJobType() != null ? req.getJobType() : "Not specified",
                req.getSalaryMin() != null ? req.getSalaryMin() : "Not disclosed",
                req.getSalaryMax() != null ? req.getSalaryMax() : "Not disclosed",
                req.getCurrency() != null ? req.getCurrency() : "INR",
                req.getJobExperienceLevel() != null ? req.getJobExperienceLevel() : "Not specified",
                jobSkills
        );

        return geminiClient.generateJson(SYSTEM, prompt, JobMatchResponse.class);
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
