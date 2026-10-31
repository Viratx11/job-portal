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
public class JobDescriptionRequest {

    @NotBlank(message = "Job title is required")
    private String title;

    private List<String> skills;
    private String experienceLevel;
    private String jobType;
    private String workMode;
    private String category;
    private String additionalContext;
}
