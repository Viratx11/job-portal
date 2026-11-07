package com.virat.job.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractJobFromUrlResponse {

    private String title;
    private String companyName;
    private String category;
    private String description;
    private String requirements;
    private String responsibilities;
    private String benefits;
    private String city;
    private String country;
    private Long minSalary;
    private Long maxSalary;
    private String jobType;         // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
    private String workMode;        // REMOTE, ONSITE, HYBRID
    private String experienceLevel;  // ENTRY, JUNIOR, MID, SENIOR, LEAD
    private List<String> skills;
    private List<String> tags;
    private String sourceUrl;
}

