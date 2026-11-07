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
public class JobMatchRequest {

    private List<String> preferredWorkModes;
    private List<String> preferredJobTypes;
    private Long minSalary;
    private List<String> preferredIndustries;
    private String candidateExperienceLevel;
    private List<String> candidateSkills;
    private String candidateResumeSummary;
    private List<String> candidateProjects;

    private String jobTitle;
    private String workMode;
    private String jobType;
    private Long salaryMin;
    private Long salaryMax;
    private String currency;
    private String industry;
    private String jobExperienceLevel;
    private List<String> jobSkills;
}
