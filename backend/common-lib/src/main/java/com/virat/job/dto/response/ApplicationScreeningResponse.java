package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.AiShortlistStatus;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationScreeningResponse {
    private Long id;
    private Integer overallScore;
    private Integer skillsMatchScore;
    private Integer experienceMatchScore;
    private Integer educationMatchScore;
    private AiShortlistStatus shortlistStatus;
    private String summary;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> strengths;
    private List<String> concerns;
    private Boolean isStale;
    private LocalDateTime screenedAt;
    private String screeningVersion;
}
