package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkScreeningRequest {

    @NotNull
    private String jobTitle;

    private String experienceLevel;
    private List<String> requiredSkills;
    private String responsibilities;

    @NotEmpty
    private List<CandidateScreeningInput> candidates;
}
