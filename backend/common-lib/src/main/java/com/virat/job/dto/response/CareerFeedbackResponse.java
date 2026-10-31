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
public class CareerFeedbackResponse {

    private int profileStrength;
    private List<String> shortlistingIssues;
    private List<Improvement> improvements;
    private List<JobTarget> targetJobs;
    private String overallSummary;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Improvement {
        private String area;
        private String issue;
        private String action;
        private String priority;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JobTarget {
        private String jobTitle;
        private String reason;
        private String skillMatch;
    }
}
