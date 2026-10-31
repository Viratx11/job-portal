package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.ParseStatus;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeParseJobResponse {
    private Long id;
    private Long candidateId;
    private Long resumeId;
    private String originalFileName;
    private String fileType;
    private ParseStatus status;
    private String parsedData;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
