package com.virat.job.mapper;

import com.virat.job.dto.response.CompanyResponse;
import com.virat.job.dto.response.CompanySummaryResponse;
import com.virat.job.dto.response.SocialLinkResponse;
import com.virat.job.modal.Company;
import com.virat.job.modal.SocialLink;


import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CompanyMapper {


    public static CompanyResponse toResponse(Company company) {
        List<SocialLinkResponse> socialLinks = company.getSocialLinks() == null
                ? Collections.emptyList()
                : company.getSocialLinks().stream()
                .map(CompanyMapper::toSocialLinkResponse)
                .collect(Collectors.toList());

        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .slug(company.getSlug())
                .tagLine(company.getTagLine())
                .description(company.getDescription())
                .logoUrl(company.getLogoUrl())
                .coverImageUrl(company.getCoverImageUrl())
                .websiteUrl(company.getWebsite())
                .email(company.getEmail())
                .phone(company.getPhone())
                .foundedYear(company.getFoundedYear())
                .companySize(company.getCompanySize())
                .companyType(company.getCompanyType())
                .industryType(company.getIndustryType())
                .status(company.getStatus())
                .active(company.getActive())
                .ownerId(company.getOwnerId())
                .socialLinks(socialLinks)
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .verifiedAt(company.getVerifiedAt())
                .build();
    }


    public static CompanySummaryResponse toSummaryResponse(Company company) {
        return CompanySummaryResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .slug(company.getSlug())
                .logoUrl(company.getLogoUrl())
                .tagline(company.getTagLine())
                .industryType(company.getIndustryType())
                .companySize(company.getCompanySize())
                .verified(company.isVerified())
                .build();
    }

    private static SocialLinkResponse toSocialLinkResponse(SocialLink sl) {
        return SocialLinkResponse.builder()
                .platform(sl.getPlatform())
                .url(sl.getUrl())
                .build();
    }
}