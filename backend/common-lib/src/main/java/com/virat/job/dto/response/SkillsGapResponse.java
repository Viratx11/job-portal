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
public class SkillsGapResponse {

    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> partialMatch;
    private List<String> prioritySkillsToLearn;
    private List<LearningRecommendation> learningRecommendations;
    private String overallReadiness;
    private String summary;

    @JsonIgnoreProperties(ignoreUnknown = true)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearningRecommendation {
        private String skill;
        private String why;
        private String howToLearn;
    }
}
