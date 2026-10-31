package com.virat.job.service;

import com.virat.job.dto.request.ParseResumeRequest;
import com.virat.job.dto.response.ResumeParseJobResponse;

import java.util.List;

public interface ResumeParseJobService {
    ResumeParseJobResponse createParseJob(Long candidateId, ParseResumeRequest req) throws Exception;
    ResumeParseJobResponse getParseJob(Long parseJobId, Long candidateId) throws Exception;
    List<ResumeParseJobResponse> getMyParseJobs(Long candidateId);
}
