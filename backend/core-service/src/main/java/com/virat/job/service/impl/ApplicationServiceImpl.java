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
import com.virat.job.modal.OutboxEvent;
import com.virat.job.repository.OutboxRepository;
import com.virat.job.repository.ApplicationNoteRepository;
import com.virat.job.repository.ApplicationScreeningRepository;
import com.virat.job.repository.ApplicationSpecification;
import com.virat.job.repository.ApplicationStatusHistoryRepository;
import com.virat.job.repository.JobApplicationRepository;
import com.virat.job.service.ApplicationService;
import com.virat.job.service.ApplicationSlotLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final ApplicationScreeningRepository screeningRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final ApplicationNoteRepository noteRepository;
    private final ApplicationSlotLockService slotLockService;
    private final JobService jobService;
    private final CompanyService companyService;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public ApplicationResponse createApplication(Long candidateId, CreateApplicationRequest req) throws Exception {
        if (applicationRepository.existsByCandidateIdAndJobId(candidateId, req.getJobId())) {
            throw new Exception("You have already applied for this job");
        }

        JobResponse job = jobService.getJobById(req.getJobId());

        int maxOpenings = job.getOpenings() != null ? job.getOpenings() : 10;
        boolean locked = slotLockService.acquireSlot(job.getId(), maxOpenings);
        if (!locked) {
            throw new RuntimeException("All application slots for this job opening are currently full.");
        }

        JobApplication application = ApplicationMapper.toEntity(req, candidateId,
                job.getCompanyId(), job.getEmployerId());
        application = applicationRepository.save(application);
        try {
            jobService.incrementApplicationCount(job.getId());
        } catch (Exception ignored) {
        }

        String payloadJson = objectMapper.writeValueAsString(Map.of(
            "applicationId", application.getId(),
            "jobId", job.getId(),
            "resumeId", application.getResumeId() != null ? application.getResumeId() : 0L,
            "jobDescription", job.getDescription() != null ? job.getDescription() : job.getTitle(),
            "resumeText", req.getCoverLetter() != null ? req.getCoverLetter() : ""
        ));

        outboxRepository.save(OutboxEvent.builder()
            .aggregateType("JOB_APPLICATION")
            .aggregateId(application.getId())
            .eventType("APPLICATION_CREATED")
            .payload(payloadJson)
            .processed(false)
            .createdAt(LocalDateTime.now())
            .build());

        historyRepository.save(ApplicationStatusHistory.builder()
                .application(application)
                .fromStatus(null)
                .toStatus(ApplicationStatus.PENDING)
                .changedByUserId(candidateId)
                .note("Application submitted")
                .build());

        return buildFullResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id, Long userId) throws Exception {
        JobApplication application = getApplicationEntity(id);
        if (!application.getCandidateId().equals(userId) && !application.getEmployerId().equals(userId)) {
            throw new Exception("You do not have permission to view this application");
        }
        return buildFullResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(Long candidateId) {
        return applicationRepository.findByCandidateId(candidateId)
                .stream().map(this::buildFullResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForJob(Long jobId, Long employerId) throws Exception {
        JobResponse job = jobService.getJobById(jobId);
        if (!job.getEmployerId().equals(employerId)) {
            throw new Exception("You are not the employer for this job");
        }
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
        slotLockService.releaseSlot(application.getJobId());

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

        List<ApplicationStatusHistory> history =
                historyRepository.findByApplicationIdOrderByChangedAtAsc(applicationId);
        if (!history.isEmpty()) {
            historyRepository.deleteAll(history);
        }

        List<ApplicationNote> notes =
                noteRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId);
        if (!notes.isEmpty()) {
            noteRepository.deleteAll(notes);
        }

        screeningRepository.findByApplicationId(applicationId)
                .ifPresent(screeningRepository::delete);

        if (application.getStatus() != ApplicationStatus.WITHDRAWN) {
            slotLockService.releaseSlot(application.getJobId());
        }

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
