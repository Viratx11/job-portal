package com.virat.job.service;

import com.virat.job.client.GeminiClient;
import com.virat.job.dto.request.BulkScreeningRequest;
import com.virat.job.dto.request.CandidateScreeningInput;
import com.virat.job.dto.request.CoverLetterRequest;
import com.virat.job.dto.request.InterviewQuestionsRequest;
import com.virat.job.dto.request.ScreeningScoreRequest;
import com.virat.job.dto.request.SkillsGapRequest;
import com.virat.job.dto.response.AiTextResponse;
import com.virat.job.dto.response.BulkScreeningResponse;
import com.virat.job.dto.response.InterviewQuestionsResponse;
import com.virat.job.dto.response.ScreeningScoreResponse;
import com.virat.job.dto.response.SkillsGapResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
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
        String skills = req.getCandidateSkills() != null
                ? String.join(", ", req.getCandidateSkills()) : "Not provided";
        String experience = req.getCandidateExperience() != null
                ? String.join("; ", req.getCandidateExperience()) : "Not provided";

        String prompt = """
                Write a compelling, personalized cover letter.

                Position: %s
                Job Description: %s
                Target Company: %s

                Candidate Profile:
                - Name: %s
                - Professional Summary: %s
                - Key Skills: %s
                - Relevant Experience: %s

                Write a 3-paragraph cover letter:
                Paragraph 1 (Opening): Express specific enthusiasm for this exact role and company.
                Paragraph 2 (Body): Connect 2-3 of the candidate's strongest experiences/skills directly to the job requirements.
                Paragraph 3 (Closing): Confident call to action.

                Rules:
                - Write as the candidate (first person)
                - Be specific — avoid generic statements
                - Maximum 300 words
                - Do NOT use placeholders like [Company Name]
                - Do NOT include subject line or date
                """.formatted(
                req.getJobTitle(),
                req.getJobDescription() != null ? req.getJobDescription() : "Not provided",
                req.getTargetCompanyName() != null ? req.getTargetCompanyName() : "your organization",
                req.getCandidateName(),
                req.getCandidateSummary() != null ? req.getCandidateSummary() : "Experienced professional",
                skills, experience
        );

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }

    public ScreeningScoreResponse scoreCandidate(ScreeningScoreRequest req) {
        String requiredSkills = req.getRequiredSkills() != null
                ? String.join(", ", req.getRequiredSkills()) : "Not specified";
        String candidateSkills = req.getCandidateSkills() != null
                ? String.join(", ", req.getCandidateSkills()) : "Not specified";
        String candidateExp = req.getCandidateExperience() != null
                ? String.join("; ", req.getCandidateExperience()) : "Not provided";
        String candidateEdu = req.getCandidateEducation() != null && !req.getCandidateEducation().isEmpty()
                ? String.join("; ", req.getCandidateEducation()) : "Not provided";

        String prompt = """
                Score this job application based on how well the candidate matches the requirements.

                Job Requirements:
                - Title: %s
                - Experience Level Required: %s
                - Required Skills: %s
                - Key Responsibilities: %s

                Candidate Profile:
                - Professional Summary: %s
                - Skills: %s
                - Work Experience: %s
                - Education: %s

                Respond with ONLY this JSON (no explanation, no markdown):
                {
                  "score": 85,
                  "skillsMatchScore": 90,
                  "experienceMatchScore": 80,
                  "educationMatchScore": 75,
                  "matchedSkills": ["skill1", "skill2"],
                  "missingSkills": ["skill3"],
                  "strengths": ["strength1", "strength2"],
                  "concerns": ["concern1"],
                  "summary": "2-3 sentence honest assessment"
                }
                """.formatted(
                req.getJobTitle() != null ? req.getJobTitle() : "Not specified",
                req.getExperienceLevel() != null ? req.getExperienceLevel() : "Not specified",
                requiredSkills,
                req.getResponsibilities() != null ? req.getResponsibilities() : "Not provided",
                req.getCandidateSummary() != null ? req.getCandidateSummary() : "Not provided",
                candidateSkills, candidateExp, candidateEdu
        );

        return geminiClient.generateJson(SYSTEM, prompt, ScreeningScoreResponse.class);
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
        String prompt = """
                Generate interview questions for this job role.

                Job Title: %s
                Experience Level: %s
                Interview Type: %s
                Job Description: %s

                Generate 8-10 questions and respond with ONLY this JSON:
                {
                  "questions": [
                    { "question": "question text", "category": "Technical | Behavioral | Situational | HR", "difficulty": "Easy | Medium | Hard" }
                  ]
                }

                Rules:
                - Mix of technical, behavioral, and situational questions
                - Difficulty should vary across Easy, Medium, Hard
                - Questions must be specific to the job title and experience level
                """.formatted(
                req.getJobTitle(),
                req.getExperienceLevel() != null ? req.getExperienceLevel() : "MID",
                req.getInterviewType() != null ? req.getInterviewType() : "General",
                req.getJobDescription() != null ? req.getJobDescription() : "Not provided"
        );

        return geminiClient.generateJson(SYSTEM, prompt, InterviewQuestionsResponse.class);
    }

    public AiTextResponse summarizeApplicationNotes(List<String> notes) {
        String allNotes = String.join("\n---\n", notes);
        String prompt = """
                Summarize these recruiter notes about a job candidate into a concise TL;DR.

                Recruiter Notes:
                %s

                Write a 3-5 sentence summary covering:
                1. Overall impression of the candidate
                2. Key strengths mentioned
                3. Any concerns or points to verify
                4. Recommended next step (if mentioned)

                Keep it factual, based only on what's in the notes.
                """.formatted(allNotes);

        return AiTextResponse.builder()
                .content(geminiClient.generateText(SYSTEM, prompt))
                .build();
    }
}
