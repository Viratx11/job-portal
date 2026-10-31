package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddWorkExperienceRequest {
    @NotBlank(message = "Company name is required")
    @Size(max = 150)
    private String companyName;

    private String companyLogoUrl;

    @NotBlank(message = "Job title is required")
    @Size(max = 150)
    private String jobTitle;

    private JobType employmentType;
    private String location;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
    private Boolean isCurrentJob;

    @Size(max = 5000)
    private String description;

    private List<String> technologies;
    private Integer displayOrder;
}
