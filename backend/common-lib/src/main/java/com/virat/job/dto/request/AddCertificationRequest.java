package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddCertificationRequest {
    @NotBlank(message = "Certification name is required")
    @Size(max = 200)
    private String name;

    @NotBlank(message = "Issuing organization is required")
    @Size(max = 150)
    private String issuingOrganization;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    private LocalDate expiryDate;

    @Size(max = 100)
    private String credentialId;

    private String credentialUrl;
    private Integer displayOrder;
}
