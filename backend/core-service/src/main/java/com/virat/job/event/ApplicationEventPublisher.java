package com.virat.job.event;

import com.virat.job.service.CompanyService;
import com.virat.job.service.JobService;
import com.virat.job.service.UserService;
import com.virat.job.domain.ApplicationStatus;
import com.virat.job.dto.event.ApplicationNoteAddedEvent;
import com.virat.job.dto.event.ApplicationStatusChangedEvent;
import com.virat.job.dto.response.CompanySummaryResponse;
import com.virat.job.dto.response.JobSummaryResponse;
import com.virat.job.dto.response.UserResponse;
import com.virat.job.modal.JobApplication;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationEventPublisher {

    public static final String TOPIC_STATUS_CHANGED = "application.status.changed";
    public static final String TOPIC_NOTE_ADDED = "application.note.added";

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserService userService;
    private final JobService jobService;
    private final CompanyService companyService;

    public void publishStatusChanged(JobApplication app, ApplicationStatus oldStatus, String note) {
        try {
            UserResponse candidate = com.virat.job.mapper.UserMapper.toDTO(
                userService.getUserById(app.getCandidateId())
            );
            JobSummaryResponse job = jobService.getJobSummaryById(app.getJobId());
            CompanySummaryResponse company = com.virat.job.mapper.CompanyMapper.toSummaryResponse(
                companyService.getCompanyEntityById(app.getCompanyId())
            );

            ApplicationStatusChangedEvent event = ApplicationStatusChangedEvent.builder()
                    .applicationId(app.getId())
                    .candidateId(app.getCandidateId())
                    .candidateEmail(candidate != null ? candidate.getEmail() : null)
                    .candidateName(candidate != null ? candidate.getFullName() : "Candidate")
                    .oldStatus(oldStatus)
                    .newStatus(app.getStatus())
                    .note(note)
                    .jobTitle(job != null ? job.getTitle() : "Position")
                    .companyName(company != null ? company.getName() : "Company")
                    .changedAt(LocalDateTime.now())
                    .build();

            kafkaTemplate.send(TOPIC_STATUS_CHANGED, String.valueOf(app.getId()), event);
            log.info("Published status-changed event for application {}", app.getId());

        } catch (Exception e) {
            log.error("Failed to publish status-changed event for application {}", app.getId(), e);
        }
    }

    public void publishNoteAdded(JobApplication app) {
        try {
            UserResponse candidate = com.virat.job.mapper.UserMapper.toDTO(
                userService.getUserById(app.getCandidateId())
            );
            JobSummaryResponse job = jobService.getJobSummaryById(app.getJobId());
            CompanySummaryResponse company = com.virat.job.mapper.CompanyMapper.toSummaryResponse(
                companyService.getCompanyEntityById(app.getCompanyId())
            );

            ApplicationNoteAddedEvent event = ApplicationNoteAddedEvent.builder()
                    .applicationId(app.getId())
                    .candidateId(app.getCandidateId())
                    .candidateEmail(candidate != null ? candidate.getEmail() : null)
                    .candidateName(candidate != null ? candidate.getFullName() : "Candidate")
                    .jobTitle(job != null ? job.getTitle() : "Position")
                    .companyName(company != null ? company.getName() : "Company")
                    .addedAt(LocalDateTime.now())
                    .build();

            kafkaTemplate.send(TOPIC_NOTE_ADDED, String.valueOf(app.getId()), event);
            log.info("Published note-added event for application {}", app.getId());

        } catch (Exception e) {
            log.error("Failed to publish note-added event for application {}", app.getId(), e);
        }
    }
}
