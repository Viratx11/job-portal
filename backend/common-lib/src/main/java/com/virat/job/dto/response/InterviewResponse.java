package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.virat.job.domain.InterviewStatus;
import com.virat.job.domain.InterviewType;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponse {

    private Long id;
    private Long applicationId;
    private Long candidateId;
    private Long jobId;
    private Long companyId;

    private InterviewType interviewType;
    private InterviewStatus status;
    private Integer roundNumber;

    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String location;
    private String meetingLink;

    private List<Long> interviewerIds;
    private String candidateInstructions;

    private String feedback;
    private Integer rating;
    private String recommendation;

    private String cancellationReason;
    private LocalDateTime cancelledAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
