package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeParseResponse {

    private PersonalInfo personalInfo;
    private String summary;
    private List<WorkExperience> workExperiences;
    private List<Education> educations;
    private List<String> skills;
    private List<Certification> certifications;
    private List<Language> languages;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PersonalInfo {
        private String fullName;
        private String email;
        private String phone;
        private String location;
        private String linkedIn;
        private String github;
        private String website;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WorkExperience {
        private String companyName;
        private String jobTitle;
        private String startDate;
        private String endDate;
        private boolean isCurrent;
        private String description;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Education {
        private String schoolName;
        private String degree;
        private String field;
        private String startDate;
        private String endDate;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Certification {
        private String name;
        private String issuer;
        private String issueDate;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Language {
        private String language;
        private String proficiency;
    }
}
