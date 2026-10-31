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
public class ResumeImprovementResponse {

    private int overallScore;
    private List<Improvement> improvements;
    private List<String> strengths;
    private String summary;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Improvement {
        private String section;
        private String issue;
        private String suggestion;
        private String priority;
    }
}
