package com.virat.job.service;

import com.virat.job.dto.request.AddWorkExperienceRequest;
import com.virat.job.dto.response.WorkExperienceResponse;

import java.util.List;

public interface WorkExperienceService {

    WorkExperienceResponse addWorkExperience(Long resumeId, Long candidateId, AddWorkExperienceRequest req) throws Exception;

    List<WorkExperienceResponse> getWorkExperiences(Long resumeId) throws Exception;

    WorkExperienceResponse updateWorkExperience(Long resumeId, Long experienceId, Long candidateId, AddWorkExperienceRequest req) throws Exception;

    void deleteWorkExperience(Long resumeId, Long experienceId, Long candidateId) throws Exception;
}
