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
public class JobAlertSuggestResponse {

    private List<String> suggestedKeywords;
    private List<String> suggestedLocations;
    private List<String> suggestedJobTypes;
    private List<String> suggestedWorkModes;
    private List<String> suggestedExperienceLevels;
    private List<String> suggestedIndustries;
    private String reasoning;
}
