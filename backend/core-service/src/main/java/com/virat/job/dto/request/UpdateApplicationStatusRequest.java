package com.virat.job.dto.request;

import com.virat.job.domain.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateApplicationStatusRequest {

    @NotNull(message = "New status is required")
    private ApplicationStatus status;

    private String note;
}
