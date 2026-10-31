package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.ProficiencyLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddResumeSkillRequest {
    @NotBlank(message = "Skill name is required")
    @Size(max = 100)
    private String skillName;

    private ProficiencyLevel proficiencyLevel;

    @Min(0)
    private Integer yearsOfExperience;

    private Integer displayOrder;
}
