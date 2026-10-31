package com.virat.job.service.impl;

import com.virat.job.domain.ProficiencyLevel;
import com.virat.job.dto.request.AddResumeSkillRequest;
import com.virat.job.dto.response.ResumeSkillResponse;
import com.virat.job.mapper.ResumeMapper;
import com.virat.job.modal.Resume;
import com.virat.job.modal.ResumeSkill;
import com.virat.job.repository.ResumeSkillRepository;
import com.virat.job.service.ResumeService;
import com.virat.job.service.ResumeSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeSkillServiceImpl implements ResumeSkillService {

    private final ResumeSkillRepository skillRepository;
    private final ResumeService resumeService;

    @Override
    public ResumeSkillResponse addSkill(Long resumeId, Long candidateId, AddResumeSkillRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        if (skillRepository.existsByResume_IdAndSkillNameIgnoreCase(resumeId, req.getSkillName()))
            throw new Exception("Skill '" + req.getSkillName() + "' already exists in this resume");

        ResumeSkill skill = ResumeSkill.builder()
                .resume(resume)
                .skillName(req.getSkillName())
                .proficiencyLevel(req.getProficiencyLevel() != null ? req.getProficiencyLevel() : ProficiencyLevel.INTERMEDIATE)
                .yearsOfExperience(req.getYearsOfExperience())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();

        return ResumeMapper.toSkillResponse(skillRepository.save(skill));
    }

    @Override
    public List<ResumeSkillResponse> getSkills(Long resumeId) throws Exception {
        resumeService.getResumeEntityById(resumeId);
        return skillRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId)
                .stream().map(ResumeMapper::toSkillResponse).collect(Collectors.toList());
    }

    @Override
    public ResumeSkillResponse updateSkill(Long resumeId, Long skillId, Long candidateId, AddResumeSkillRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        ResumeSkill skill = getEntityById(skillId, resumeId);

        skill.setSkillName(req.getSkillName());
        if (req.getProficiencyLevel() != null) skill.setProficiencyLevel(req.getProficiencyLevel());
        if (req.getYearsOfExperience() != null) skill.setYearsOfExperience(req.getYearsOfExperience());
        if (req.getDisplayOrder() != null) skill.setDisplayOrder(req.getDisplayOrder());

        return ResumeMapper.toSkillResponse(skillRepository.save(skill));
    }

    @Override
    public void deleteSkill(Long resumeId, Long skillId, Long candidateId) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        ResumeSkill skill = getEntityById(skillId, resumeId);
        skillRepository.delete(skill);
    }

    private ResumeSkill getEntityById(Long id, Long resumeId) throws Exception {
        ResumeSkill skill = skillRepository.findById(id)
                .orElseThrow(() -> new Exception("Skill not found with id: " + id));
        if (!skill.getResume().getId().equals(resumeId))
            throw new Exception("Skill does not belong to this resume");
        return skill;
    }

    private void assertOwner(Resume resume, Long candidateId) throws Exception {
        if (!resume.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this resume");
    }
}
