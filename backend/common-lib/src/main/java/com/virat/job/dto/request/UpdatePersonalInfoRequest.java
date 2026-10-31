package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePersonalInfoRequest {
    @Size(max = 80) private String firstName;
    @Size(max = 80) private String lastName;
    @Size(max = 200) private String headline;
    @Email @Size(max = 150) private String email;
    @Size(max = 20) private String phone;
    @Size(max = 100) private String city;
    @Size(max = 100) private String country;
    private String profileImage;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String websiteUrl;
}
