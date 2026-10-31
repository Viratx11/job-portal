package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.*;
import java.math.BigDecimal;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSearchRequest {
    private String keyword;
    private Long categoryId;
    private Set<Long> skillIds;
    private Set<Long> tagIds;
    private Long companyId;

    // Location filter
    private String city;
    private String state;
    private String country;

    // Salary filter
    private BigDecimal minSalary;
    private BigDecimal maxSalary;

    private JobType jobType;
    private WorkMode workMode;
    private ExperienceLevel experienceLevel;
    private JobStatus status;

    private Integer minOpenings;
    private Integer maxOpenings;
}
