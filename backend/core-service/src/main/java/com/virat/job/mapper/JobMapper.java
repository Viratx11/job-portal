package com.virat.job.mapper;

import com.virat.job.dto.response.*;
import com.virat.job.modal.Job;
import com.virat.job.modal.JobCategory;
import com.virat.job.modal.JobSkill;
import com.virat.job.modal.JobTag;
import com.virat.job.modal.embeddable.JobLocation;
import com.virat.job.modal.embeddable.SalaryRange;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class JobMapper {

    public static JobSkillResponse toSkillResponse(JobSkill skill) {
        if (skill == null) return null;
        return JobSkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .slug(skill.getSlug())
                .category(skill.getCategory())
                .active(skill.getActive())
                .build();
    }

    public static JobTagResponse toTagResponse(JobTag tag) {
        if (tag == null) return null;
        return JobTagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .slug(tag.getSlug())
                .build();
    }

    public static JobCategoryResponse toCategoryResponse(JobCategory category, boolean includeSubCategories) {
        if (category == null) return null;

        List<JobCategoryResponse> subCategories = Collections.emptyList();
        if (includeSubCategories && category.getSubCategories() != null) {
            subCategories = category.getSubCategories().stream()
                    .map(sub -> toCategoryResponse(sub, false))
                    .collect(Collectors.toList());
        }

        return JobCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .iconUrl(category.getIconUrl())
                .active(category.getActive())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .subCategories(subCategories)
                .createdAt(category.getCreatedAt())
                .build();
    }

    public static JobSummaryResponse toSummaryResponse(Job job) {
        if (job == null) return null;

        JobLocation loc = job.getLocation();
        SalaryRange sal = job.getSalaryRange();

        Set<String> skillNames = job.getSkills() != null
                ? job.getSkills().stream().map(JobSkill::getName).collect(Collectors.toSet())
                : Collections.emptySet();
        Set<String> tagNames = job.getTags() != null
                ? job.getTags().stream().map(JobTag::getName).collect(Collectors.toSet())
                : Collections.emptySet();

        return JobSummaryResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .companyId(job.getCompanyId())
                .city(loc != null ? loc.getCity() : null)
                .country(loc != null ? loc.getCountry() : null)
                .minSalary(sal != null ? sal.getMinSalary() : null)
                .maxSalary(sal != null ? sal.getMaxSalary() : null)
                .currency(sal != null ? sal.getCurrency() : null)
                .salaryDisclosed(sal != null ? sal.getDisclosed() : null)
                .jobType(job.getJobType())
                .workMode(job.getWorkMode())
                .experienceLevel(job.getExperienceLevel())
                .status(job.getStatus())
                .categoryName(job.getCategory() != null ? job.getCategory().getName() : null)
                .skillNames(skillNames)
                .tagNames(tagNames)
                .openings(job.getOpenings())
                .applicationCount(job.getApplicationCount())
                .applicationDeadline(job.getApplicationDeadline())
                .createdAt(job.getCreatedAt())
                .build();
    }

    public static JobResponse toResponse(Job job) {
        if (job == null) return null;

        JobLocation loc = job.getLocation();
        SalaryRange sal = job.getSalaryRange();

        Set<JobSkillResponse> skills = job.getSkills() != null
                ? job.getSkills().stream().map(JobMapper::toSkillResponse).collect(Collectors.toSet())
                : Collections.emptySet();
        Set<JobTagResponse> tags = job.getTags() != null
                ? job.getTags().stream().map(JobMapper::toTagResponse).collect(Collectors.toSet())
                : Collections.emptySet();

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .responsibilities(job.getResponsibilities())
                .benefits(job.getBenefits())
                .companyId(job.getCompanyId())
                .employerId(job.getEmployerId())
                .category(toCategoryResponse(job.getCategory(), false))
                .skills(skills)
                .tags(tags)
                .address(loc != null ? loc.getAddress() : null)
                .city(loc != null ? loc.getCity() : null)
                .state(loc != null ? loc.getState() : null)
                .country(loc != null ? loc.getCountry() : null)
                .zipCode(loc != null ? loc.getZipCode() : null)
                .minSalary(sal != null ? sal.getMinSalary() : null)
                .maxSalary(sal != null ? sal.getMaxSalary() : null)
                .currency(sal != null ? sal.getCurrency() : null)
                .salaryPeriod(sal != null ? sal.getPeriod() : null)
                .salaryNegotiable(sal != null ? sal.getNegotiable() : null)
                .salaryDisclosed(sal != null ? sal.getDisclosed() : null)
                .jobType(job.getJobType())
                .workMode(job.getWorkMode())
                .experienceLevel(job.getExperienceLevel())
                .status(job.getStatus())
                .openings(job.getOpenings())
                .applicationDeadline(job.getApplicationDeadline())
                .expiresAt(job.getExpiresAt())
                .active(job.getActive())
                .viewCount(job.getViewCount())
                .applicationCount(job.getApplicationCount())
                .publishedAt(job.getPublishedAt())
                .closedAt(job.getClosedAt())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
