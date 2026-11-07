package com.virat.job.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractCertAiResponse {
    private String certificationName;
    private String issuingOrganization;
    private String credentialUrl;
    private String issueDate;
}

