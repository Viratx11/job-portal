package com.virat.job.dto.response;

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
public class ApplicationStatusHistoryResponse {
    private Long id;
    private ApplicationStatus fromStatus;
    private ApplicationStatus toStatus;
    private Long changedByUserId;
    private String note;
    private LocalDateTime changedAt;
}
