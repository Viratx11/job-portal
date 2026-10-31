package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.SkillCategory;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSkillResponse {
    private Long id;
    private String name;
    private String slug;
    private SkillCategory category;
    private Boolean active;
}
