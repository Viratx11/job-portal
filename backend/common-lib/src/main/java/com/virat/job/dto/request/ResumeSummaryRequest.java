package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeSummaryRequest {

    private String targetJobTitle;
    private List<WorkExperienceInfo> workExperiences;
    private List<String> skills;
    private List<EducationInfo> educations;
    private Integer yearsOfExperience;

    @Data 
    @Builder 
    public static class WorkExperienceInfo {
        private String jobTitle;
        private String company;
        private String description;
    }

    @Data 
    @Builder 
    public static class EducationInfo {
        private String degree;
        private String fieldOfStudy;
        private String institutionName;
    }
}
