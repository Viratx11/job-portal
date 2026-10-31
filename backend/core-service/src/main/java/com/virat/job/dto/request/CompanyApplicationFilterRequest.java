package com.virat.job.dto.request;

import com.virat.job.domain.AiShortlistStatus;
import com.virat.job.domain.ApplicationSource;
import com.virat.job.domain.ApplicationStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class CompanyApplicationFilterRequest {

    private Long jobId;

    private ApplicationStatus status;

    private ApplicationSource source;

    private Boolean isRead;

    private Boolean isStarred;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate appliedFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate appliedTo;

    private AiShortlistStatus aiShortlistStatus;

    private Integer minAiScore;

    private String sortBy;
}
