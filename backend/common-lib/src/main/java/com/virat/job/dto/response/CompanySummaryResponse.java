package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.virat.job.domain.CompanySize;
import com.virat.job.domain.IndustryType;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanySummaryResponse {

    private Long id;
    private String name;
    private String slug;
    private String logoUrl;
    private String tagline;
    private IndustryType industryType;
    private CompanySize companySize;
    private Boolean verified;
    private String city;
    private String country;
}
