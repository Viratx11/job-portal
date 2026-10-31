package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String iconUrl;
    private Boolean active;
    private Long parentId;
    private String parentName;
    private List<JobCategoryResponse> subCategories;
    private LocalDateTime createdAt;
}
