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
public class CompanyDescriptionRequest {

    @NotBlank(message = "Company name is required")
    private String name;

    private String industry;
    private String companyType;
    private String size;
    private String tagline;
    private String additionalContext;
}
