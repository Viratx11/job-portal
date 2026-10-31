package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchEnhanceResponse {

    private List<String> keywords;
    private List<String> locations;
    private List<String> jobTypes;
    private List<String> workModes;
    private List<String> experienceLevels;
    private Long minSalary;
    private List<String> skills;
}
