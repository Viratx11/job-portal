package com.virat.job.mapper;

import com.virat.job.dto.request.CreateApplicationRequest;
import com.virat.job.dto.response.*;
import com.virat.job.modal.ApplicationNote;
import com.virat.job.modal.ApplicationScreening;
import com.virat.job.modal.ApplicationStatusHistory;
import com.virat.job.modal.JobApplication;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ApplicationMapper {

    private ApplicationMapper() {}

    public static JobApplication toEntity(CreateApplicationRequest req,
                                          Long candidateId,
                                          Long companyId,
                                          Long employerId) {
        return JobApplication.builder()
                .candidateId(candidateId)
                .jobId(req.getJobId())
                .companyId(companyId)
                .employerId(employerId)
                .resumeId(req.getResumeId())
                .coverLetter(req.getCoverLetter())
                .expectedSalary(req.getExpectedSalary())
                .availableFrom(req.getAvailableFrom())
                .build();
    }

    public static ApplicationNoteResponse toNoteResponse(ApplicationNote note) {
        return ApplicationNoteResponse.builder()
                .id(note.getId())
                .addedByUserId(note.getAddedByUserId())
                .content(note.getContent())
                .createdAt(note.getCreatedAt())
                .build();
    }

    public static List<ApplicationNoteResponse> toNoteResponseList(List<ApplicationNote> notes) {
        if (notes == null) return Collections.emptyList();
        return notes.stream().map(ApplicationMapper::toNoteResponse).collect(Collectors.toList());
    }

    public static ApplicationStatusHistoryResponse toHistoryResponse(ApplicationStatusHistory h) {
        return ApplicationStatusHistoryResponse.builder()
                .id(h.getId())
                .fromStatus(h.getFromStatus())
                .toStatus(h.getToStatus())
                .changedByUserId(h.getChangedByUserId())
                .note(h.getNote())
                .changedAt(h.getChangedAt())
                .build();
    }

    public static List<ApplicationStatusHistoryResponse> toHistoryResponseList(
            List<ApplicationStatusHistory> history) {
        if (history == null) return Collections.emptyList();
        return history.stream().map(ApplicationMapper::toHistoryResponse).collect(Collectors.toList());
    }

    public static ApplicationScreeningResponse toScreeningResponse(ApplicationScreening s) {
        if (s == null) return null;
        return ApplicationScreeningResponse.builder()
                .id(s.getId())
                .overallScore(s.getOverallScore())
                .skillsMatchScore(s.getSkillsMatchScore())
                .experienceMatchScore(s.getExperienceMatchScore())
                .educationMatchScore(s.getEducationMatchScore())
                .shortlistStatus(s.getShortlistStatus())
                .summary(s.getSummary())
                .matchedSkills(s.getMatchedSkills())
                .missingSkills(s.getMissingSkills())
                .strengths(s.getStrengths())
                .concerns(s.getConcerns())
                .isStale(s.getIsStale())
                .screenedAt(s.getScreenedAt())
                .screeningVersion(s.getScreeningVersion())
                .build();
    }

    public static ApplicationResponse toResponse(JobApplication application,
                                                  List<ApplicationStatusHistory> history,
                                                  List<ApplicationNote> notes,
                                                  JobSummaryResponse job,
                                                  CompanySummaryResponse company,
                                                  UserResponse candidate,
                                                  ApplicationScreening screening) {
        return ApplicationResponse.builder()
                .id(application.getId())
                .candidate(candidate)
                .employerId(application.getEmployerId())
                .job(job)
                .company(company)
                .status(application.getStatus())
                .resumeId(application.getResumeId())
                .coverLetter(application.getCoverLetter())
                .expectedSalary(application.getExpectedSalary())
                .availableFrom(application.getAvailableFrom())
                .isRead(application.getIsRead())
                .isStarred(application.getIsStarred())
                .statusHistory(toHistoryResponseList(history))
                .notes(toNoteResponseList(notes))
                .withdrawnAt(application.getWithdrawnAt())
                .withdrawnReason(application.getWithdrawnReason())
                .appliedAt(application.getAppliedAt())
                .updatedAt(application.getUpdatedAt())
                .screening(toScreeningResponse(screening))
                .build();
    }

    public static ApplicationSummaryResponse toSummaryResponse(JobApplication a) {
        return ApplicationSummaryResponse.builder()
                .id(a.getId())
                .candidateId(a.getCandidateId())
                .jobId(a.getJobId())
                .companyId(a.getCompanyId())
                .status(a.getStatus())
                .isRead(a.getIsRead())
                .isStarred(a.getIsStarred())
                .aiScore(a.getAiScore())
                .aiShortlistStatus(a.getAiShortlistStatus())
                .appliedAt(a.getAppliedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
