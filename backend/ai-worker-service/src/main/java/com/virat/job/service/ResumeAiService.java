package com.virat.job.service;

import com.virat.job.client.GeminiClient;
import com.virat.job.dto.request.CareerFeedbackRequest;
import com.virat.job.dto.request.ResumeImprovementRequest;
import com.virat.job.dto.request.ResumeParseRequest;
import com.virat.job.dto.request.ResumeSummaryRequest;
import com.virat.job.dto.request.WorkExperienceBulletRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.CareerFeedbackResponse;
import com.virat.job.dto.response.ResumeImprovementResponse;
import com.virat.job.dto.response.ResumeParseResponse;
import com.virat.job.dto.response.WorkExperienceBulletsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeAiService {

    private final GeminiClient geminiClient;

    private static final String SYSTEM = """
            You are a senior resume writer and career coach with 15+ years of experience in the Indian tech job market.
            You specialize in ATS-optimized resumes, career coaching, and professional branding.
            Always be specific and results-oriented. Never use generic phrases like "hard-working", "team player", or "passionate".
            When asked for JSON, respond ONLY with valid JSON — no explanation, no markdown fences.
            """;

    public AiTextResponse generateProfessionalSummary(ResumeSummaryRequest req) {
        String experiences = req.getWorkExperiences() != null
                ? req.getWorkExperiences().stream()
                        .map(e -> e.getJobTitle() + " at " + e.getCompany()
                                + (e.getDescription() != null && !e.getDescription().isBlank() ?
                                ": " + e.getDescription() : ""))
                        .collect(Collectors.joining("; "))
                : "Not provided";
        String skills = req.getSkills() != null ? String.join(", ", req.getSkills()) : "Not provided";
        String educations = req.getEducations() != null
                ? req.getEducations().stream()
                        .map(e -> e.getDegree()
                                + (e.getFieldOfStudy() != null ? " in " + e.getFieldOfStudy() : "")
                                + (e.getInstitutionName() != null ? " from " + e.getInstitutionName() : ""))
                        .collect(Collectors.joining("; "))
                : "Not provided";

        String prompt = """
                Write a compelling professional summary for a resume.

                Candidate Profile:
                - Target Job Title: %s
                - Years of Experience: %d
                - Work Experience: %s
                - Key Skills: %s
                - Education: %s

                Write a 3-4 sentence professional summary that:
                1. Opens with seniority level and area of expertise
                2. Highlights 2-3 key achievements or strengths with impact
                3. Mentions specific technical skills relevant to the target role
                4. Ends with a value proposition or career goal

                Rules:
                - Write in first person (no "I" at the start)
                - Keep it under 80 words
                - Make it ATS-friendly
                """.formatted(
                req.getTargetJobTitle() != null ? req.getTargetJobTitle() : "Software Developer",
                req.getYearsOfExperience() != null ? req.getYearsOfExperience() : 0,
                experiences, skills, educations
        );

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }

    public WorkExperienceBulletsResponse generateWorkExperienceBullets(WorkExperienceBulletRequest req) {
        String prompt = """
                Transform this work experience into powerful, ATS-friendly resume bullet points.

                Role: %s at %s
                Raw Description: %s
                Achievements/Hints: %s

                Generate exactly 4-5 bullet points that:
                1. Start with strong action verbs
                2. Include quantifiable metrics where possible
                3. Highlight business impact and technical achievements
                4. Are concise (under 20 words each)

                { "bullets": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4", "bullet point 5"] }
                """.formatted(
                req.getJobTitle(),
                req.getCompany() != null ? req.getCompany() : "the company",
                req.getRawDescription(),
                req.getAchievementsHint() != null ? req.getAchievementsHint() : "None"
        );

        return geminiClient.generateJson(SYSTEM, prompt, WorkExperienceBulletsResponse.class);
    }

    public ResumeParseResponse parseResume(ResumeParseRequest req) {
        String prompt = """
                Parse this resume text and extract all structured information.

                Resume Text:
                %s

                Extract all available information and return JSON in this exact structure:
                {
                  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "linkedIn": "", "github": "", "website": "" },
                  "summary": "",
                  "workExperiences": [
                    { "companyName": "", "jobTitle": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM or null if current", "isCurrent": false, "description": "" }
                  ],
                  "educations": [
                    { "schoolName": "", "degree": "", "field": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM" }
                  ],
                  "skills": ["skill1", "skill2"],
                  "certifications": [
                    { "name": "", "issuer": "", "issueDate": "YYYY-MM" }
                  ],
                  "languages": [
                    { "language": "", "proficiency": "BASIC or INTERMEDIATE or ADVANCED or NATIVE" }
                  ]
                }

                Rules:
                - Use null for missing fields
                - Dates in YYYY-MM format
                - If current job, set endDate to null and isCurrent to true
                """.formatted(req.getResumeText());

        return geminiClient.generateJson(SYSTEM, prompt, ResumeParseResponse.class);
    }

    public CareerFeedbackResponse getCareerFeedback(CareerFeedbackRequest req) {
        String prompt = """
                Analyze this resume and deliver an honest, actionable career feedback report.

                Target Job Title (if provided): %s
                Resume Content:
                %s

                {
                  "profileStrength": 65,
                  "shortlistingIssues": ["Reason 1", "Reason 2", "Reason 3"],
                  "improvements": [
                    { "area": "Skills | Summary | Experience | Education", "issue": "What is weak", "action": "How to fix it", "priority": "HIGH | MEDIUM | LOW" }
                  ],
                  "targetJobs": [
                    { "jobTitle": "Recommended Title", "reason": "Why this suits the profile", "skillMatch": "HIGH | MEDIUM | LOW" }
                  ],
                  "overallSummary": "2-3 sentences of honest career advice"
                }
                """.formatted(
                req.getTargetJobTitle() != null ? req.getTargetJobTitle() : "Not specified",
                req.getResumeContent()
        );

        return geminiClient.generateJson(SYSTEM, prompt, CareerFeedbackResponse.class);
    }

    public ResumeImprovementResponse getResumeImprovementTips(ResumeImprovementRequest req) {
        String prompt = """
                Analyze this resume and provide specific, actionable improvement suggestions.

                Target Job Title: %s

                Resume Content:
                %s

                {
                  "overallScore": 72,
                  "improvements": [
                    { "section": "Summary or Experience or Skills or Education", "issue": "What is wrong", "suggestion": "How to fix it", "priority": "High or Medium or Low" }
                  ],
                  "strengths": ["what is already good"],
                  "summary": "2-sentence overall assessment"
                }

                Provide 4-6 specific improvements. Score should be 0-100.
                """.formatted(
                req.getTargetJobTitle() != null ? req.getTargetJobTitle() : "Not specified",
                req.getResumeContent()
        );

        return geminiClient.generateJson(SYSTEM, prompt, ResumeImprovementResponse.class);
    }
}
