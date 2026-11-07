package com.virat.job.service.impl;

import com.virat.job.dto.request.AddWorkExperienceRequest;
import com.virat.job.dto.response.WorkExperienceResponse;
import com.virat.job.mapper.ResumeMapper;
import com.virat.job.modal.Resume;
import com.virat.job.modal.WorkExperience;
import com.virat.job.repository.WorkExperienceRepository;
import com.virat.job.service.ResumeService;
import com.virat.job.service.WorkExperienceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkExperienceServiceImpl implements WorkExperienceService {

    private final WorkExperienceRepository workExperienceRepository;
    private final ResumeService resumeService;

    @Override
    public WorkExperienceResponse addWorkExperience(Long resumeId, Long candidateId, AddWorkExperienceRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        WorkExperience we = WorkExperience.builder()
                .resume(resume)
                .companyName(req.getCompanyName())
                .companyLogoUrl(req.getCompanyLogoUrl())
                .jobTitle(req.getJobTitle())
                .employmentType(req.getEmploymentType())
                .location(req.getLocation())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isCurrentJob(req.getIsCurrentJob() != null ? req.getIsCurrentJob() : false)
                .description(req.getDescription())
                .technologies(req.getTechnologies() != null ? req.getTechnologies() : new ArrayList<>())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();

        WorkExperience saved = workExperienceRepository.save(we);
        resumeService.syncResumeSummaryAndPdf(resumeId);
        return ResumeMapper.toWorkExperienceResponse(saved);
    }

    @Override
    public List<WorkExperienceResponse> getWorkExperiences(Long resumeId) throws Exception {

        return workExperienceRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId)
                .stream().map(ResumeMapper::toWorkExperienceResponse).collect(Collectors.toList());
    }

    @Override
    public WorkExperienceResponse updateWorkExperience(Long resumeId, Long experienceId, Long candidateId, AddWorkExperienceRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        WorkExperience we = getEntityById(experienceId, resumeId);

        we.setCompanyName(req.getCompanyName());
        we.setCompanyLogoUrl(req.getCompanyLogoUrl());
        we.setJobTitle(req.getJobTitle());
        we.setEmploymentType(req.getEmploymentType());
        we.setLocation(req.getLocation());
        we.setStartDate(req.getStartDate());
        we.setEndDate(req.getEndDate());
        if (req.getIsCurrentJob() != null) we.setIsCurrentJob(req.getIsCurrentJob());
        if (req.getDescription() != null) we.setDescription(req.getDescription());
        if (req.getTechnologies() != null) we.setTechnologies(req.getTechnologies());
        if (req.getDisplayOrder() != null) we.setDisplayOrder(req.getDisplayOrder());

        WorkExperience saved = workExperienceRepository.save(we);
        resumeService.syncResumeSummaryAndPdf(resumeId);
        return ResumeMapper.toWorkExperienceResponse(saved);
    }

    @Override
    public void deleteWorkExperience(Long resumeId, Long experienceId, Long candidateId) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        WorkExperience we = getEntityById(experienceId, resumeId);
        workExperienceRepository.delete(we);
        resumeService.syncResumeSummaryAndPdf(resumeId);
    }

    private WorkExperience getEntityById(Long id, Long resumeId) throws Exception {
        WorkExperience we = workExperienceRepository.findById(id)
                .orElseThrow(() -> new Exception("Work experience not found with id: " + id));
        if (!we.getResume().getId().equals(resumeId))
            throw new Exception("Work experience does not belong to this resume");
        return we;
    }

    private void assertOwner(Resume resume, Long candidateId) throws Exception {
        if (!resume.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this resume");
    }
}
