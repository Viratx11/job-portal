package com.virat.job.service;

import com.virat.job.dto.request.JobRequest;
import com.virat.job.dto.request.JobSearchRequest;
import com.virat.job.dto.response.JobResponse;
import com.virat.job.dto.response.JobSummaryResponse;
import com.virat.job.modal.Job;

import java.util.List;

public interface JobService {

    JobResponse createJob(Long employerId, JobRequest req) throws Exception;

    JobResponse getJobById(Long id) throws Exception;

    JobSummaryResponse getJobSummaryById(Long id) throws Exception;

    List<JobResponse> getJobs(JobSearchRequest req);

    List<JobResponse> getJobsByCompany(Long companyId);

    List<JobResponse> getJobsByEmployer(Long employerId);

    List<JobResponse> getJobsByCategory(Long categoryId);

    List<JobResponse> getAllJobsAdmin();

    JobResponse updateJob(Long jobId, Long employerId, JobRequest req) throws Exception;

    JobResponse publishJob(Long jobId, Long employerId) throws Exception;

    JobResponse closeJob(Long jobId, Long employerId) throws Exception;

    void deleteJob(Long jobId, Long employerId) throws Exception;

    void incrementViewCount(Long jobId) throws Exception;

    void incrementApplicationCount(Long jobId) throws Exception;

    Job getJobEntityById(Long id) throws Exception;
}
