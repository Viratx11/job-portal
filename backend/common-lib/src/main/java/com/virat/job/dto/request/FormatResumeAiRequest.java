package com.virat.job.dto.request;

import com.virat.job.domain.ResumeTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormatResumeAiRequest {
    private Long resumeId;
    private ResumeTemplate template;
    private String customInstructions;
}

