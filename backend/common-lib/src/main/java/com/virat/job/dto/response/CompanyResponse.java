package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.CompanySize;
import com.virat.job.domain.CompanyStatus;
import com.virat.job.domain.CompanyType;
import com.virat.job.domain.IndustryType;
import java.time.LocalDateTime;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {
    private Long id;
    private String name;

    private String slug;

    private String tagLine;

    private String description;

    private String email;
    private String phone;

    private String logoUrl;

    private String coverImageUrl;

    private String websiteUrl;

    private Integer foundedYear;

    private CompanySize companySize;

    private CompanyType companyType;

    private IndustryType industryType;

    private Boolean active;
    private CompanyStatus status ;

    private String registrationNumber;

    private Long ownerId;

    private List<SocialLinkResponse> socialLinks;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime verifiedAt;
}
