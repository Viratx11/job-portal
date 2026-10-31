package com.virat.job.service.impl;

import com.virat.job.dto.request.CreateResumeRequest;
import com.virat.job.dto.request.UpdatePersonalInfoRequest;
import com.virat.job.dto.request.UpdateResumeRequest;
import com.virat.job.dto.response.*;
import com.virat.job.mapper.ResumeMapper;
import com.virat.job.modal.*;
import com.virat.job.modal.embeddable.PersonalInfo;
import com.virat.job.repository.*;
import com.virat.job.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final EducationRepository educationRepository;
    private final ResumeSkillRepository skillRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final AwardRepository awardRepository;
    private final LanguageRepository languageRepository;

    @Override
    public ResumeResponse createResume(Long candidateId, CreateResumeRequest req) throws Exception {

        boolean isFirst = !resumeRepository.existsByCandidateIdAndActiveTrue(candidateId);

        Resume resume = Resume.builder()
                .candidateId(candidateId)
                .title(req.getTitle())
                .template(req.getTemplate() != null ? req.getTemplate() : com.virat.job.domain.ResumeTemplate.PROFESSIONAL)
                .visibility(req.getVisibility() != null ? req.getVisibility() : com.virat.job.domain.ResumeVisibility.PRIVATE)
                .isDefault(isFirst || Boolean.TRUE.equals(req.getIsDefault()))
                .build();

        if (Boolean.TRUE.equals(req.getIsDefault()) && !isFirst) {//As mo two default resumes so clear default of prev one
            clearDefaultFlag(candidateId);
        }

        return ResumeMapper.toSummaryResponse(resumeRepository.save(resume));
    }

    @Override
    public ResumeResponse getResume(Long resumeId, Long candidateId) throws Exception {
        Resume resume = getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        return buildFullResponse(resume);
    }

    @Override
    public List<ResumeResponse> getMyResumes(Long candidateId) {
        return resumeRepository.findByCandidateIdAndActiveTrue(candidateId)
                .stream().map(ResumeMapper::toSummaryResponse).toList();
    }

    @Override
    public ResumeResponse updateResume(Long resumeId, Long candidateId, UpdateResumeRequest req) throws Exception {
        Resume resume = getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        if (req.getTitle() != null) resume.setTitle(req.getTitle());
        if (req.getTemplate() != null) resume.setTemplate(req.getTemplate());
        if (req.getVisibility() != null) resume.setVisibility(req.getVisibility());
        if (req.getSummary() != null) resume.setSummary(req.getSummary());
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            clearDefaultFlag(candidateId);
            resume.setIsDefault(true);
        }

        return buildFullResponse(resumeRepository.save(resume));
    }

    @Override
    public ResumeResponse updatePersonalInfo(Long resumeId, Long candidateId, UpdatePersonalInfoRequest req) throws Exception {
        Resume resume = getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        PersonalInfo pi = resume.getPersonalInfo() != null ? resume.getPersonalInfo() : new PersonalInfo();
        if (req.getFirstName() != null) pi.setFirstName(req.getFirstName());
        if (req.getLastName() != null) pi.setLastName(req.getLastName());
        if (req.getHeadline() != null) pi.setHeadline(req.getHeadline());
        if (req.getEmail() != null) pi.setEmail(req.getEmail());
        if (req.getPhone() != null) pi.setPhone(req.getPhone());
        if (req.getCity() != null) pi.setCity(req.getCity());
        if (req.getCountry() != null) pi.setCountry(req.getCountry());
        if (req.getProfileImage() != null) pi.setProfileImage(req.getProfileImage());
        if (req.getLinkedinUrl() != null) pi.setLinkedinUrl(req.getLinkedinUrl());
        if (req.getGithubUrl() != null) pi.setGithubUrl(req.getGithubUrl());
        if (req.getPortfolioUrl() != null) pi.setPortfolioUrl(req.getPortfolioUrl());
        if (req.getWebsiteUrl() != null) pi.setWebsiteUrl(req.getWebsiteUrl());
        resume.setPersonalInfo(pi);

        return buildFullResponse(resumeRepository.save(resume));
    }

    @Override
    public ResumeResponse setDefault(Long resumeId, Long candidateId) throws Exception {
        Resume resume = getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        clearDefaultFlag(candidateId);
        resume.setIsDefault(true);
        return ResumeMapper.toSummaryResponse(resumeRepository.save(resume));
    }

    @Override
    public void deleteResume(Long resumeId, Long candidateId) throws Exception {
        Resume resume = getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        resume.setActive(false);
        resumeRepository.save(resume);
    }

    @Override
    public Resume getResumeEntityById(Long resumeId) throws Exception {
        return resumeRepository.findById(resumeId)
                .filter(r -> r.getActive())
                .orElseThrow(() -> new Exception("Resume not found with id: " + resumeId));
    }

    private void assertOwner(Resume resume, Long candidateId) throws Exception {
        if (!resume.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this resume");
    }

    private void clearDefaultFlag(Long candidateId) {
        resumeRepository.findByCandidateIdAndIsDefaultTrueAndActiveTrue(candidateId)
                .ifPresent(r -> { r.setIsDefault(false); resumeRepository.save(r); });
    }

    private ResumeResponse buildFullResponse(Resume resume) {

        List<WorkExperience> workExperiences = workExperienceRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Education> educations = educationRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<ResumeSkill> skills = skillRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Project> projects = projectRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Certification> certifications = certificationRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Award> awards = awardRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        List<Language> languages = languageRepository.findByResume_IdOrderByDisplayOrderAsc(resume.getId());
        return ResumeMapper.toResponse(resume, workExperiences, educations, skills, projects, certifications, awards, languages);
    }
}
