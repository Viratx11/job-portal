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
public class AwardResponse {
    private Long id;
    private String title;
    private String issuedBy;
    private LocalDate awardDate;
    private String description;
    private Integer displayOrder;
}
