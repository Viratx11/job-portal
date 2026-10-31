package com.virat.job.modal.embeddable;

import com.virat.job.domain.SalaryPeriod;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.math.BigDecimal;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryRange {

    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;

    @Enumerated(EnumType.STRING)
    private SalaryPeriod period;

    private Boolean negotiable;
    private Boolean disclosed;
}
