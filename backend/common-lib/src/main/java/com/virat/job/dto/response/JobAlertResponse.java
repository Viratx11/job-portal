package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.virat.job.domain.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobAlertResponse {
    private Long id;
    private Long candidateId;
    private String alertName;
    private Boolean isActive;
    private AlertFrequency frequency;
    private String keywords;
    private List<String> locations;
    private List<JobType> jobTypes;
    private List<WorkMode> workModes;
    private List<ExperienceLevel> experienceLevels;
    private List<IndustryType> industries;
    private BigDecimal minSalary;
    private String salaryCurrency;
    private SalaryPeriod salaryPeriod;
    private LocalDateTime lastTriggeredAt;
    private LocalDateTime nextScheduledAt;
    private Integer totalMatchesSent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
