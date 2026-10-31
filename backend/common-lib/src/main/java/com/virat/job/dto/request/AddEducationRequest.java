package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddEducationRequest {
    @NotBlank(message = "Institution name is required")
    @Size(max = 200)
    private String institutionName;

    @NotBlank(message = "Degree is required")
    @Size(max = 150)
    private String degree;

    @Size(max = 150)
    private String fieldOfStudy;

    @Size(max = 50)
    private String grade;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
    private Boolean isCurrentlyStudying;

    @Size(max = 2000)
    private String description;

    private Integer displayOrder;
}
