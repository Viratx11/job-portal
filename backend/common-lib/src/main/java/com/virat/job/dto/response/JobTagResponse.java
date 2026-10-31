package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobTagResponse {
    private Long id;
    private String name;
    private String slug;
}
