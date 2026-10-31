package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.ResumeTemplate;
import com.virat.job.domain.ResumeVisibility;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateResumeRequest {
    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    private ResumeTemplate template;
    private ResumeVisibility visibility;
    private Boolean isDefault;

    @Size(max = 5000, message = "Summary must not exceed 5000 characters")
    private String summary;
}
