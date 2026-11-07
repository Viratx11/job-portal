package com.virat.job.mapper;

import com.virat.job.dto.response.*;
import com.virat.job.modal.*;
import com.virat.job.modal.embeddable.PersonalInfo;

import java.util.List;
import java.util.stream.Collectors;

public class ResumeMapper {

    public static ResumeResponse toSummaryResponse(Resume resume) {
        return buildBase(resume).build();
    }

    public static ResumeResponse toResponse(Resume resume,
                                             List<WorkExperience> workExperiences,
                                             List<Education> educations,
                                             List<ResumeSkill> skills,
                                             List<Project> projects,
                                             List<Certification> certifications,
                                             List<Award> awards,
                                             List<Language> languages) {
        return buildBase(resume)
                .workExperiences(workExperiences.stream().map(ResumeMapper::toWorkExperienceResponse).collect(Collectors.toList()))
                .educations(educations.stream().map(ResumeMapper::toEducationResponse).collect(Collectors.toList()))
                .skills(skills.stream().map(ResumeMapper::toSkillResponse).collect(Collectors.toList()))
                .projects(projects.stream().map(ResumeMapper::toProjectResponse).collect(Collectors.toList()))
                .certifications(certifications.stream().map(ResumeMapper::toCertificationResponse).collect(Collectors.toList()))
                .awards(awards.stream().map(ResumeMapper::toAwardResponse).collect(Collectors.toList()))
                .languages(languages.stream().map(ResumeMapper::toLanguageResponse).collect(Collectors.toList()))
                .build();
    }

    private static ResumeResponse.ResumeResponseBuilder buildBase(Resume resume) {
        PersonalInfo pi = resume.getPersonalInfo();
        ResumeResponse.ResumeResponseBuilder builder = ResumeResponse.builder()
                .id(resume.getId())
                .candidateId(resume.getCandidateId())
                .title(resume.getTitle())
                .template(resume.getTemplate())
                .visibility(resume.getVisibility())
                .isDefault(resume.getIsDefault())
                .summary(resume.getSummary())
                .uploadedFileUrl(resume.getUploadedFileUrl())
                .uploadedFileName(resume.getUploadedFileName())
                .completionScore(resume.getCompletionScore())
                .active(resume.getActive())
                .lastViewedAt(resume.getLastViewedAt())
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt());

        if (pi != null) {
            builder.firstName(pi.getFirstName())
                    .lastName(pi.getLastName())
                    .headline(pi.getHeadline())
                    .email(pi.getEmail())
                    .phone(pi.getPhone())
                    .city(pi.getCity())
                    .country(pi.getCountry())
                    .profileImage(pi.getProfileImage())
                    .linkedinUrl(pi.getLinkedinUrl())
                    .githubUrl(pi.getGithubUrl())
                    .portfolioUrl(pi.getPortfolioUrl())
                    .websiteUrl(pi.getWebsiteUrl())
                    .leetcodeUrl(pi.getLeetcodeUrl())
                    .codeforcesUrl(pi.getCodeforcesUrl())
                    .codechefUrl(pi.getCodechefUrl())
                    .hackerrankUrl(pi.getHackerrankUrl());
        }
        return builder;
    }

    public static WorkExperienceResponse toWorkExperienceResponse(WorkExperience we) {
        return WorkExperienceResponse.builder()
                .id(we.getId())
                .companyName(we.getCompanyName())
                .companyLogoUrl(we.getCompanyLogoUrl())
                .jobTitle(we.getJobTitle())
                .employmentType(we.getEmploymentType())
                .location(we.getLocation())
                .startDate(we.getStartDate())
                .endDate(we.getEndDate())
                .isCurrentJob(we.getIsCurrentJob())
                .description(we.getDescription())
                .technologies(we.getTechnologies())
                .displayOrder(we.getDisplayOrder())
                .build();
    }

    public static EducationResponse toEducationResponse(Education edu) {
        return EducationResponse.builder()
                .id(edu.getId())
                .institutionName(edu.getInstitutionName())
                .degree(edu.getDegree())
                .fieldOfStudy(edu.getFieldOfStudy())
                .grade(edu.getGrade())
                .startDate(edu.getStartDate())
                .endDate(edu.getEndDate())
                .isCurrentlyStudying(edu.getIsCurrentlyStudying())
                .description(edu.getDescription())
                .displayOrder(edu.getDisplayOrder())
                .build();
    }

    public static ResumeSkillResponse toSkillResponse(ResumeSkill skill) {
        return ResumeSkillResponse.builder()
                .id(skill.getId())
                .skillName(skill.getSkillName())
                .proficiencyLevel(skill.getProficiencyLevel())
                .yearsOfExperience(skill.getYearsOfExperience())
                .displayOrder(skill.getDisplayOrder())
                .build();
    }

    public static ProjectResponse toProjectResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .technologies(project.getTechnologies())
                .projectUrl(project.getProjectUrl())
                .sourceCodeUrl(project.getSourceCodeUrl())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .isOngoing(project.getIsOngoing())
                .displayOrder(project.getDisplayOrder())
                .build();
    }

    public static CertificationResponse toCertificationResponse(Certification cert) {
        return CertificationResponse.builder()
                .id(cert.getId())
                .name(cert.getName())
                .issuingOrganization(cert.getIssuingOrganization())
                .issueDate(cert.getIssueDate())
                .expiryDate(cert.getExpiryDate())
                .credentialId(cert.getCredentialId())
                .credentialUrl(cert.getCredentialUrl())
                .displayOrder(cert.getDisplayOrder())
                .build();
    }

    public static AwardResponse toAwardResponse(Award award) {
        return AwardResponse.builder()
                .id(award.getId())
                .title(award.getTitle())
                .issuedBy(award.getIssuedBy())
                .awardDate(award.getAwardDate())
                .description(award.getDescription())
                .displayOrder(award.getDisplayOrder())
                .build();
    }

    public static LanguageResponse toLanguageResponse(Language lang) {
        return LanguageResponse.builder()
                .id(lang.getId())
                .languageName(lang.getLanguageName())
                .proficiency(lang.getProficiency())
                .displayOrder(lang.getDisplayOrder())
                .build();
    }
}
