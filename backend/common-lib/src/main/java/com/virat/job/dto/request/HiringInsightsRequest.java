package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HiringInsightsRequest {

    @NotNull
    private String jobTitle;

    private String experienceLevel;
    private List<String> requiredSkills;
    private String jobType;

    private Integer applicantCount;
    private Integer pendingCount;
    private Integer shortlistedCount;
    private Integer rejectedCount;
}
