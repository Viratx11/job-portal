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
public class CandidateScreeningInput {
    private String candidateId;
    private String candidateName;
    private String summary;
    private List<String> skills;
    private List<String> experience;
}
