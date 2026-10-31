package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSummaryResponse {
    private Long id;
    private String title;
    private Long companyId;
    private String city;
    private String country;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;
    private Boolean salaryDisclosed;
    private JobType jobType;
    private WorkMode workMode;
    private ExperienceLevel experienceLevel;
    private JobStatus status;
    private String categoryName;
    private Set<String> skillNames;
    private Set<String> tagNames;
    private Integer openings;
    private Long applicationCount;
    private LocalDate applicationDeadline;
    private LocalDateTime createdAt;
}
