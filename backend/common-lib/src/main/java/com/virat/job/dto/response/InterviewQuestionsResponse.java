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
public class InterviewQuestionsResponse {

    private List<Question> questions;

    @JsonIgnoreProperties(ignoreUnknown = true)
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String question;
        private String category;
        private String difficulty;
    }
}
