package com.virat.job.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateResumeFromLatexRequest {
    @NotBlank(message = "LaTeX code is required")
    private String latexCode;
    private String title;
}

