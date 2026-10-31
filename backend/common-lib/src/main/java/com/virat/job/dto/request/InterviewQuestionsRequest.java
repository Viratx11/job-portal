package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionsRequest {

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    private String experienceLevel;
    private String interviewType;
    private String jobDescription;
}
