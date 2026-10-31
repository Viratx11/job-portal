package com.virat.job.service.impl;

import com.virat.job.domain.SkillCategory;
import com.virat.job.dto.request.JobSkillRequest;
import com.virat.job.dto.response.JobSkillResponse;
import com.virat.job.mapper.JobMapper;
import com.virat.job.modal.JobSkill;
import com.virat.job.repository.JobSkillRepository;
import com.virat.job.service.JobSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobSkillServiceImpl implements JobSkillService {

    private final JobSkillRepository skillRepository;

    @Override
    public JobSkillResponse createSkill(JobSkillRequest req) throws Exception {
        if (skillRepository.existsByName(req.getName()))
            throw new Exception("Skill '" + req.getName() + "' already exists");

        String slug = generateUniqueSlug(req.getName());
        JobSkill skill = JobSkill.builder()
                .name(req.getName())
                .slug(slug)
                .category(req.getCategory())
                .build();

        return JobMapper.toSkillResponse(skillRepository.save(skill));
    }

    @Override
    public List<JobSkillResponse> getAllSkills() {
        return skillRepository.findByActiveTrue().stream()
                .map(JobMapper::toSkillResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobSkillResponse> getSkillsByCategory(SkillCategory category) {
        return skillRepository.findByCategoryAndActiveTrue(category).stream()
                .map(JobMapper::toSkillResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobSkillResponse> searchSkills(String keyword) {
        return skillRepository.findByNameContainingIgnoreCaseAndActiveTrue(keyword).stream()
                .map(JobMapper::toSkillResponse)
                .collect(Collectors.toList());
    }

    @Override
    public JobSkillResponse getSkillById(Long id) throws Exception {
        return JobMapper.toSkillResponse(getSkillEntityById(id));
    }

    @Override
    public JobSkillResponse updateSkill(Long id, JobSkillRequest req) throws Exception {
        JobSkill skill = getSkillEntityById(id);
        if (!skill.getName().equals(req.getName()) && skillRepository.existsByName(req.getName()))
            throw new Exception("Skill '" + req.getName() + "' already exists");

        skill.setName(req.getName());
        skill.setCategory(req.getCategory());
        return JobMapper.toSkillResponse(skillRepository.save(skill));
    }

    @Override
    public void deleteSkill(Long id) throws Exception {
        JobSkill skill = getSkillEntityById(id);
        skill.setActive(false);
        skillRepository.save(skill);
    }

    @Override
    public Set<JobSkill> getSkillEntitiesByIds(Set<Long> ids) throws Exception {
        Set<JobSkill> skills = new HashSet<>(skillRepository.findAllById(ids));
        if (skills.size() != ids.size())
            throw new Exception("One or more skill IDs are invalid");
        return skills;
    }

    private JobSkill getSkillEntityById(Long id) throws Exception {
        return skillRepository.findById(id)
                .orElseThrow(() -> new Exception("Skill not found with id: " + id));
    }

    private String generateUniqueSlug(String name) {
        String base = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
        if (!skillRepository.existsBySlug(base)) return base;
        int counter = 1;
        while (skillRepository.existsBySlug(base + "-" + counter)) counter++;
        return base + "-" + counter;
    }
}
