package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.ProficiencyLevel;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeSkillResponse {
    private Long id;
    private String skillName;
    private ProficiencyLevel proficiencyLevel;
    private Integer yearsOfExperience;
    private Integer displayOrder;
}
