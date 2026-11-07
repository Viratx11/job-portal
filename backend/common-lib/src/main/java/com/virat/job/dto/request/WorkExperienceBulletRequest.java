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
public class WorkExperienceBulletRequest {

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    private String company;

    private String rawDescription;

    private String techStack;

    private List<String> technologies;

    private String achievementsHint;
}
