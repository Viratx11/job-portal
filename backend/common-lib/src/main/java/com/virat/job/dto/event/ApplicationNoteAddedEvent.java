package com.virat.job.dto.event;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationNoteAddedEvent {
    private Long applicationId;
    private Long candidateId;
    private String candidateEmail;
    private String candidateName;
    private String jobTitle;
    private String companyName;
    private LocalDateTime addedAt;
}
