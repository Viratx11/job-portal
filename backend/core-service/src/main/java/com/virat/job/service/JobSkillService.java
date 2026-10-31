package com.virat.job.service;

import com.virat.job.domain.SkillCategory;
import com.virat.job.dto.request.JobSkillRequest;
import com.virat.job.dto.response.JobSkillResponse;
import com.virat.job.modal.JobSkill;

import java.util.List;
import java.util.Set;

public interface JobSkillService {

    JobSkillResponse createSkill(JobSkillRequest req) throws Exception;

    List<JobSkillResponse> getAllSkills();

    List<JobSkillResponse> getSkillsByCategory(SkillCategory category);

    List<JobSkillResponse> searchSkills(String keyword);

    JobSkillResponse getSkillById(Long id) throws Exception;

    JobSkillResponse updateSkill(Long id, JobSkillRequest req) throws Exception;

    void deleteSkill(Long id) throws Exception;

    Set<JobSkill> getSkillEntitiesByIds(Set<Long> ids) throws Exception;
}
