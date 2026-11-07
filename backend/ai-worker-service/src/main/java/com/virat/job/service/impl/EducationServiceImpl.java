package com.virat.job.service.impl;

import com.virat.job.dto.request.AddEducationRequest;
import com.virat.job.dto.response.EducationResponse;
import com.virat.job.mapper.ResumeMapper;
import com.virat.job.modal.Education;
import com.virat.job.modal.Resume;
import com.virat.job.repository.EducationRepository;
import com.virat.job.service.EducationService;
import com.virat.job.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EducationServiceImpl implements EducationService {

    private final EducationRepository educationRepository;
    private final ResumeService resumeService;

    @Override
    public EducationResponse addEducation(Long resumeId, Long candidateId, AddEducationRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        Education education = Education.builder()
                .resume(resume)
                .institutionName(req.getInstitutionName())
                .degree(req.getDegree())
                .fieldOfStudy(req.getFieldOfStudy())
                .grade(req.getGrade())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isCurrentlyStudying(req.getIsCurrentlyStudying() != null ? req.getIsCurrentlyStudying() : false)
                .description(req.getDescription())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();

        Education saved = educationRepository.save(education);
        resumeService.syncResumeSummaryAndPdf(resumeId);
        return ResumeMapper.toEducationResponse(saved);
    }

    @Override
    public List<EducationResponse> getEducations(Long resumeId) throws Exception {
        resumeService.getResumeEntityById(resumeId);
        return educationRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId)
                .stream().map(ResumeMapper::toEducationResponse).collect(Collectors.toList());
    }

    @Override
    public EducationResponse updateEducation(Long resumeId, Long educationId, Long candidateId, AddEducationRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Education education = getEntityById(educationId, resumeId);

        education.setInstitutionName(req.getInstitutionName());
        education.setDegree(req.getDegree());
        if (req.getFieldOfStudy() != null) education.setFieldOfStudy(req.getFieldOfStudy());
        if (req.getGrade() != null) education.setGrade(req.getGrade());
        education.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) education.setEndDate(req.getEndDate());
        if (req.getIsCurrentlyStudying() != null) education.setIsCurrentlyStudying(req.getIsCurrentlyStudying());
        if (req.getDescription() != null) education.setDescription(req.getDescription());
        if (req.getDisplayOrder() != null) education.setDisplayOrder(req.getDisplayOrder());

        Education saved = educationRepository.save(education);
        resumeService.syncResumeSummaryAndPdf(resumeId);
        return ResumeMapper.toEducationResponse(saved);
    }

    @Override
    public void deleteEducation(Long resumeId, Long educationId, Long candidateId) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Education education = getEntityById(educationId, resumeId);
        educationRepository.delete(education);
        resumeService.syncResumeSummaryAndPdf(resumeId);
    }

    private Education getEntityById(Long id, Long resumeId) throws Exception {
        Education edu = educationRepository.findById(id)
                .orElseThrow(() -> new Exception("Education not found with id: " + id));
        if (!edu.getResume().getId().equals(resumeId))
            throw new Exception("Education does not belong to this resume");
        return edu;
    }

    private void assertOwner(Resume resume, Long candidateId) throws Exception {
        if (!resume.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this resume");
    }
}
