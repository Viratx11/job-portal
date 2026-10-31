package com.virat.job.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawApplicationRequest {

    private String reason;
}
