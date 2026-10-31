package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobAlertSuggestRequest {

    private List<String> skills;
    private String experienceLevel;
    private List<String> previousJobTitles;
    private List<String> educations;
}
