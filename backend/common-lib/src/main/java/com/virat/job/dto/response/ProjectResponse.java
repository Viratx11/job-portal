package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private List<String> technologies;
    private String projectUrl;
    private String sourceCodeUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isOngoing;
    private Integer displayOrder;

    public String getLiveUrl() {
        return projectUrl;
    }

    public String getGithubUrl() {
        return sourceCodeUrl;
    }
}
