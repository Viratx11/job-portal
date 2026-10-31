package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import com.virat.job.domain.LanguageProficiency;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LanguageResponse {
    private Long id;
    private String languageName;
    private LanguageProficiency proficiency;
    private Integer displayOrder;
}
