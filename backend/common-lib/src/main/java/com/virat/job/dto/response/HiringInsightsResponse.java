package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HiringInsightsResponse {

    private String overallAssessment;
    private List<String> bottlenecks;
    private List<String> suggestions;
    private String idealCandidateProfile;
    private List<String> screeningCriteria;
    private List<String> keyRedFlags;
    private String marketDemandNote;
}
