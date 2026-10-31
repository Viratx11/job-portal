package com.virat.job.service;

import com.virat.job.dto.request.AddEducationRequest;
import com.virat.job.dto.response.EducationResponse;

import java.util.List;

public interface EducationService {

    EducationResponse addEducation(Long resumeId, Long candidateId, AddEducationRequest req) throws Exception;

    List<EducationResponse> getEducations(Long resumeId) throws Exception;

    EducationResponse updateEducation(Long resumeId, Long educationId, Long candidateId, AddEducationRequest req) throws Exception;

    void deleteEducation(Long resumeId, Long educationId, Long candidateId) throws Exception;
}
