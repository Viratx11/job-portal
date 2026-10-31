package com.virat.job.dto.event;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.ApplicationStatus;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusChangedEvent {

    private Long applicationId;
    private Long candidateId;
    private String candidateEmail;
    private String candidateName;
    private ApplicationStatus oldStatus;
    private ApplicationStatus newStatus;
    private String note;
    private String jobTitle;
    private String companyName;
    private LocalDateTime changedAt;

}
