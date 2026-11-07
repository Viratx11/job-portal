package com.virat.job.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractProjectAiResponse {
    private String title;
    private String technologiesUsed;
    private String liveUrl;
    private String githubUrl;
    private String bulletPoints;
    private List<String> bulletList;
}

