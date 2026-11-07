package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterRequest {

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    private String jobDescription;

    @NotBlank(message = "Candidate name is required")
    private String candidateName;

    private String candidateSummary;
    private List<String> candidateSkills;
    private List<String> candidateExperience;
    private String targetCompanyName;
    private String experienceLevel;
}
