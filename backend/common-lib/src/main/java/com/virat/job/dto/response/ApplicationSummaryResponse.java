package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.virat.job.domain.AiShortlistStatus;
import com.virat.job.domain.ApplicationSource;
import com.virat.job.domain.ApplicationStatus;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationSummaryResponse {

    private Long id;
    private Long candidateId;
    private Long jobId;
    private Long companyId;

    private ApplicationStatus status;
    private ApplicationSource source;

    private Boolean isRead;
    private Boolean isStarred;

    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    private Integer aiScore;
    private AiShortlistStatus aiShortlistStatus;
}
