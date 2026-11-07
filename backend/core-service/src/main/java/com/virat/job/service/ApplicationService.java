package com.virat.job.service;

import com.virat.job.dto.request.CompanyApplicationFilterRequest;
import com.virat.job.dto.request.CreateApplicationRequest;
import com.virat.job.dto.request.UpdateApplicationStatusRequest;
import com.virat.job.dto.request.WithdrawApplicationRequest;
import com.virat.job.dto.response.ApplicationResponse;
import com.virat.job.modal.JobApplication;

import java.util.List;

public interface ApplicationService {

    ApplicationResponse createApplication(Long candidateId, CreateApplicationRequest req) throws Exception;

    ApplicationResponse getApplicationById(Long id, Long userId) throws Exception;

    List<ApplicationResponse> getMyApplications(Long candidateId);

    List<ApplicationResponse> getApplicationsForJob(Long jobId, Long employerId) throws Exception;

    List<ApplicationResponse> getApplicationsForCompany(Long userId, CompanyApplicationFilterRequest filter) throws Exception;

    ApplicationResponse updateStatus(Long applicationId, Long employerId, UpdateApplicationStatusRequest req) throws Exception;

    ApplicationResponse withdraw(Long applicationId, Long candidateId, WithdrawApplicationRequest req) throws Exception;

    ApplicationResponse markAsRead(Long applicationId, Long employerId) throws Exception;

    ApplicationResponse toggleStar(Long applicationId, Long employerId) throws Exception;

    void deleteApplication(Long applicationId, Long candidateId) throws Exception;

    void markScreeningsStaleForJob(Long jobId);

    JobApplication getApplicationEntity(Long id) throws Exception;
}
