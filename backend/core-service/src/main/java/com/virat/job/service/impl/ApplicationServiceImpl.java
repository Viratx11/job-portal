package com.virat.job.service.impl;

import com.virat.job.service.CompanyService;
import com.virat.job.service.JobService;
import com.virat.job.service.UserService;
import com.virat.job.domain.ApplicationStatus;
import com.virat.job.event.ApplicationEventPublisher;
import com.virat.job.dto.request.CompanyApplicationFilterRequest;
import com.virat.job.dto.request.CreateApplicationRequest;
import com.virat.job.dto.request.UpdateApplicationStatusRequest;
import com.virat.job.dto.request.WithdrawApplicationRequest;
import com.virat.job.dto.response.ApplicationResponse;
import com.virat.job.dto.response.CompanySummaryResponse;
import com.virat.job.dto.response.JobResponse;
import com.virat.job.dto.response.JobSummaryResponse;
import com.virat.job.dto.response.UserResponse;
import com.virat.job.mapper.ApplicationMapper;
import com.virat.job.modal.ApplicationNote;
import com.virat.job.modal.ApplicationScreening;
import com.virat.job.modal.ApplicationStatusHistory;
import com.virat.job.modal.JobApplication;
import com.virat.job.repository.ApplicationNoteRepository;
import com.virat.job.repository.ApplicationScreeningRepository;
import com.virat.job.repository.ApplicationSpecification;
import com.virat.job.repository.ApplicationStatusHistoryRepository;
import com.virat.job.repository.JobApplicationRepository;
import com.virat.job.service.ApplicationService;
import com.virat.job.service.AsyncScreeningService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final ApplicationScreeningRepository screeningRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final ApplicationNoteRepository noteRepository;
    private final JobService jobService;
    private final CompanyService companyService;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;
    private final AsyncScreeningService asyncScreeningService;

    @Override
    @Transactional
    public ApplicationResponse createApplication(Long candidateId, CreateApplicationRequest req) throws Exception {
        if (applicationRepository.existsByCandidateIdAndJobId(candidateId, req.getJobId())) {
            throw new Exception("You have already applied for this job");
        }

        JobResponse job = jobService.getJobById(req.getJobId());

        // ResumeResponse resume = resumeClient.getResumeById(req.getResumeId(), candidateId);
        // if (!resume.getCandidateId().equals(candidateId)) {
        //     throw new Exception("Resume does not belong to you");
        // }

        JobApplication application = ApplicationMapper.toEntity(req, candidateId,
                job.getCompanyId(), job.getEmployerId());
        application = applicationRepository.save(application);

        historyRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .fromStatus(null)
                .toStatus(ApplicationStatus.PENDING)
                .changedByUserId(candidateId)
                .note("Application submitted")
                .build());

        // Fire AI screening in background — does not block the candidate's response
        asyncScreeningService.runScreeningAsync(application);

        return buildFullResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id) throws Exception {
        return buildFullResponse(getApplicationEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(Long candidateId) {
        return applicationRepository.findByCandidateId(candidateId)
                .stream().map(this::buildFullResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobId(jobId)
                .stream().map(this::buildFullResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForCompany(Long userId, CompanyApplicationFilterRequest filter) throws Exception{
        Long companyId = companyService.getMyCompany(userId).getId();

        LocalDateTime from = filter.getAppliedFrom() != null ? filter.getAppliedFrom().atStartOfDay() : null;
        LocalDateTime to = filter.getAppliedTo() != null ? filter.getAppliedTo().atTime(LocalTime.MAX) : null;

        Sort sort = buildSort(filter.getSortBy());

        return applicationRepository.findAll(
                ApplicationSpecification.forCompanyWithFilters(
                        companyId,
                        filter.getJobId(),
                        filter.getStatus(),
                        filter.getSource(),
                        filter.getIsRead(),
                        filter.getIsStarred(),
                        from,
                        to,
                        filter.getAiShortlistStatus(),
                        filter.getMinAiScore()
                ), sort).stream()
                .map(this::buildFullResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApplicationResponse updateStatus(Long applicationId, Long employerId, UpdateApplicationStatusRequest req) throws Exception {
        JobApplication application = getApplicationEntity(applicationId);
        assertEmployer(application, employerId);

        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new Exception("Cannot update status of a withdrawn application");
        }
        if (application.getStatus() == req.getStatus()) {
            throw new Exception("Application is already in status: " + req.getStatus());
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(req.getStatus());
        application = applicationRepository.save(application);

        historyRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .fromStatus(oldStatus)
                .toStatus(req.getStatus())
                .changedByUserId(employerId)
                .note(req.getNote())
                .build());

        eventPublisher.publishStatusChanged(application, oldStatus, req.getNote());

        return buildFullResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse withdraw(Long applicationId, Long candidateId, WithdrawApplicationRequest req) throws Exception {
        JobApplication application = getApplicationEntity(applicationId);
        assertCandidate(application, candidateId);

        if (application.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new Exception("Application is already withdrawn");
        }
        if (application.getStatus() == ApplicationStatus.HIRED) {
            throw new Exception("Cannot withdraw an accepted offer");
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.WITHDRAWN);
        application.setWithdrawnAt(LocalDateTime.now());
        application.setWithdrawnReason(req.getReason());
        application = applicationRepository.save(application);

        historyRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .fromStatus(oldStatus)
                .toStatus(ApplicationStatus.WITHDRAWN)
                .changedByUserId(candidateId)
                .note(req.getReason())
                .build());

        eventPublisher.publishStatusChanged(application, oldStatus, req.getReason());

        return buildFullResponse(application);
    }

    @Override
    @Transactional
    public ApplicationResponse markAsRead(Long applicationId, Long employerId) throws Exception {
        JobApplication application = getApplicationEntity(applicationId);
        assertEmployer(application, employerId);
        application.setIsRead(true);
        return buildFullResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional
    public ApplicationResponse toggleStar(Long applicationId, Long employerId) throws Exception {
        JobApplication application = getApplicationEntity(applicationId);
        assertEmployer(application, employerId);
        application.setIsStarred(!application.getIsStarred());
        return buildFullResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional
    public void deleteApplication(Long applicationId, Long candidateId) throws Exception {
        JobApplication application = getApplicationEntity(applicationId);
        assertCandidate(application, candidateId);
        applicationRepository.delete(application);
    }

    @Override
    @Transactional
    public void markScreeningsStaleForJob(Long jobId) {
        List<Long> applicationIds = applicationRepository.findByJobId(jobId)
                .stream().map(JobApplication::getId).collect(Collectors.toList());
        if (applicationIds.isEmpty()) return;
        List<ApplicationScreening> screenings = screeningRepository.findByApplicationIdIn(applicationIds);
        screenings.forEach(s -> s.setIsStale(true));
        screeningRepository.saveAll(screenings);
    }

    @Override
    public JobApplication getApplicationEntity(Long id) throws Exception {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new Exception("Application not found with id: " + id));
    }

    private void assertEmployer(JobApplication application, Long employerId) throws Exception {
        if (!application.getEmployerId().equals(employerId)) {
            throw new Exception("You are not the employer for this application");
        }
    }

    private void assertCandidate(JobApplication application, Long candidateId) throws Exception {
        if (!application.getCandidateId().equals(candidateId)) {
            throw new Exception("You are not the owner of this application");
        }
    }

    private Sort buildSort(String sortBy) {
        if ("AI_SCORE_DESC".equals(sortBy)) {
            return Sort.by(Sort.Order.desc("aiScore").with(Sort.NullHandling.NULLS_LAST));
        } else if ("AI_SCORE_ASC".equals(sortBy)) {
            return Sort.by(Sort.Order.asc("aiScore").with(Sort.NullHandling.NULLS_LAST));
        }
        return Sort.by(Sort.Direction.DESC, "appliedAt");
    }

    private ApplicationResponse buildFullResponse(JobApplication application) {
        List<ApplicationStatusHistory> history =
                historyRepository.findByApplicationIdOrderByChangedAtAsc(application.getId());
        List<ApplicationNote> notes =
                noteRepository.findByApplicationIdOrderByCreatedAtDesc(application.getId());

        try {
            JobSummaryResponse job = jobService.getJobSummaryById(application.getJobId());
            CompanySummaryResponse company = com.virat.job.mapper.CompanyMapper.toSummaryResponse(
                    companyService.getCompanyEntityById(application.getCompanyId())
            );
            UserResponse candidate = com.virat.job.mapper.UserMapper.toDTO(
                    userService.getUserById(application.getCandidateId())
            );

            ApplicationScreening screening =
                    screeningRepository.findByApplicationId(application.getId()).orElse(null);

            return ApplicationMapper.toResponse(application, history, notes, job, company, candidate, screening);
        } catch (Exception e) {
            throw new RuntimeException("Failed to build application response: " + e.getMessage(), e);
        }
    }
}
