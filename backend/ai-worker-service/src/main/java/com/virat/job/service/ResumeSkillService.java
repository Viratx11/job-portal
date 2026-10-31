package com.virat.job.service;

import com.virat.job.dto.request.AddResumeSkillRequest;
import com.virat.job.dto.response.ResumeSkillResponse;

import java.util.List;

public interface ResumeSkillService {

    ResumeSkillResponse addSkill(Long resumeId, Long candidateId, AddResumeSkillRequest req) throws Exception;

    List<ResumeSkillResponse> getSkills(Long resumeId) throws Exception;

    ResumeSkillResponse updateSkill(Long resumeId, Long skillId, Long candidateId, AddResumeSkillRequest req) throws Exception;

    void deleteSkill(Long resumeId, Long skillId, Long candidateId) throws Exception;
}
