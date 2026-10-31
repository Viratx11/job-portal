package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationResponse {
    private Long id;
    private String institutionName;
    private String degree;
    private String fieldOfStudy;
    private String grade;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrentlyStudying;
    private String description;
    private Integer displayOrder;
}
