package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String requirements;
    private String responsibilities;
    private String benefits;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Company ID is required")
    private Long companyId;

    private Set<Long> skillIds;
    private Set<Long> tagIds;

    // Location
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    private String zipCode;

    // Salary
    @DecimalMin(value = "0.0", inclusive = false, message = "Minimum salary must be greater than 0")
    private BigDecimal minSalary;

    @DecimalMin(value = "0.0", inclusive = false, message = "Maximum salary must be greater than 0")
    private BigDecimal maxSalary;

    @Size(max = 10, message = "Currency code must not exceed 10 characters")
    private String currency;

    private SalaryPeriod salaryPeriod;
    private Boolean salaryNegotiable;
    private Boolean salaryDisclosed;

    @NotNull(message = "Job type is required")
    private JobType jobType;

    @NotNull(message = "Work mode is required")
    private WorkMode workMode;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    @Min(value = 1, message = "Openings must be at least 1")
    private Integer openings;

    @Future(message = "Application deadline must be a future date")
    private LocalDate applicationDeadline;

    @Future(message = "Expiry date must be a future date")
    private LocalDate expiresAt;
}
