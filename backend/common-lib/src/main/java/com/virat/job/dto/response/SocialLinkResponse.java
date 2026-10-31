package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.SocialPlatform;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLinkResponse {

    private SocialPlatform platform;

    private String url;
}
