package com.virat.job.dto.request;

import com.virat.job.domain.CompanySize;
import com.virat.job.domain.CompanyType;
import com.virat.job.domain.IndustryType;
import com.virat.job.domain.SocialPlatform;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @Size(max = 200, message = "Tagline must not exceed 200 characters")
    private String tagline;

    private String description;
    private String logoUrl;
    private String coverImageUrl;

    @Pattern(regexp = "^(https?://).*", message = "Website must be a valid URL")
    private String website;

    @Email(message = "Company email must be valid")
    private String email;

    private String phone;

    @Min(value = 1800L, message = "Founded year seems too old")
    @Max(value = 2100L, message = "Founded year is invalid")
    private Integer foundedYear;

    @NotNull(message = "Company size is required")
    private CompanySize companySize;

    @NotNull(message = "Company type is required")
    private CompanyType companyType;

    @NotNull(message = "Industry type is required")
    private IndustryType industryType;

    private String registrationNumber;

    private List<SocialLinkEntry> socialLinks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SocialLinkEntry {
        @NotNull(message = "Platform is required")
        private SocialPlatform platform;

        @NotBlank(message = "URL is required")
        @Pattern(regexp = "^(https?://).*", message = "URL must be valid")
        private String url;
    }
}
