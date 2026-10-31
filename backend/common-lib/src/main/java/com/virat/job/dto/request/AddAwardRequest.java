package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddAwardRequest {
    @NotBlank(message = "Award title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 150)
    private String issuedBy;

    private LocalDate awardDate;

    @Size(max = 2000)
    private String description;

    private Integer displayOrder;
}
