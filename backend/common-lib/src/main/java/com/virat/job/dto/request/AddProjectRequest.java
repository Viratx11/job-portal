package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddProjectRequest {
    @NotBlank(message = "Project title is required")
    @Size(max = 150)
    private String title;

    @Size(max = 5000)
    private String description;

    private List<String> technologies;
    private String technologiesUsed;
    private String projectUrl;
    private String liveUrl;
    private String sourceCodeUrl;
    private String githubUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isOngoing;
    private Integer displayOrder;

    public List<String> getResolvedTechnologies() {
        if (technologies != null && !technologies.isEmpty()) return technologies;
        if (technologiesUsed != null && !technologiesUsed.isBlank()) {
            return java.util.Arrays.stream(technologiesUsed.split("[,|/]"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
        return java.util.List.of();
    }

    public String getResolvedProjectUrl() {
        if (projectUrl != null && !projectUrl.isBlank()) return projectUrl.trim();
        if (liveUrl != null && !liveUrl.isBlank()) return liveUrl.trim();
        return null;
    }

    public String getResolvedSourceCodeUrl() {
        if (sourceCodeUrl != null && !sourceCodeUrl.isBlank()) return sourceCodeUrl.trim();
        if (githubUrl != null && !githubUrl.isBlank()) return githubUrl.trim();
        return null;
    }
}
