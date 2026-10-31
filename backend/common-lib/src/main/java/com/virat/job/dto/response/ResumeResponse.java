package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.virat.job.domain.ResumeTemplate;
import com.virat.job.domain.ResumeVisibility;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {
    private Long id;
    private Long candidateId;
    private String title;
    private ResumeTemplate template;
    private ResumeVisibility visibility;
    private Boolean isDefault;

    private String firstName;
    private String lastName;
    private String headline;
    private String email;
    private String phone;
    private String city;
    private String country;
    private String profileImage;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String websiteUrl;

    private String summary;
    private String uploadedFileUrl;
    private String uploadedFileName;
    private Integer completionScore;
    private Boolean active;
    private LocalDateTime lastViewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<WorkExperienceResponse> workExperiences;
    private List<EducationResponse> educations;
    private List<ResumeSkillResponse> skills;
    private List<ProjectResponse> projects;
    private List<CertificationResponse> certifications;
    private List<AwardResponse> awards;
    private List<LanguageResponse> languages;
}
