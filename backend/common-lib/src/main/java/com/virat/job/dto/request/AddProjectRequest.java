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
    private String projectUrl;
    private String sourceCodeUrl;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isOngoing;
    private Integer displayOrder;
}
