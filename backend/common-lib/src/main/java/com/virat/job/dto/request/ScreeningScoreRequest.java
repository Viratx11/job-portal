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
public class ScreeningScoreRequest {

    private String jobTitle;
    private String experienceLevel;
    private List<String> requiredSkills;
    private String responsibilities;

    private String candidateSummary;
    private List<String> candidateSkills;
    private List<String> candidateExperience;
    private List<String> candidateEducation;
}
