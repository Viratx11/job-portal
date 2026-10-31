package com.virat.job.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.LanguageProficiency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddLanguageRequest {
    @NotBlank(message = "Language name is required")
    @Size(max = 80)
    private String languageName;

    @NotNull(message = "Proficiency is required")
    private LanguageProficiency proficiency;

    private Integer displayOrder;
}
