package com.virat.job.service.impl;

import com.virat.job.dto.request.AddProjectRequest;
import com.virat.job.dto.response.ProjectResponse;
import com.virat.job.mapper.ResumeMapper;
import com.virat.job.modal.Project;
import com.virat.job.modal.Resume;
import com.virat.job.repository.ProjectRepository;
import com.virat.job.service.ProjectService;
import com.virat.job.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ResumeService resumeService;

    @Override
    public ProjectResponse addProject(Long resumeId, Long candidateId, AddProjectRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        Project project = Project.builder()
                .resume(resume)
                .title(req.getTitle())
                .description(req.getDescription())
                .technologies(req.getTechnologies() != null ? req.getTechnologies() : new ArrayList<>())
                .projectUrl(req.getProjectUrl())
                .sourceCodeUrl(req.getSourceCodeUrl())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isOngoing(req.getIsOngoing() != null ? req.getIsOngoing() : false)
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();

        return ResumeMapper.toProjectResponse(projectRepository.save(project));
    }

    @Override
    public List<ProjectResponse> getProjects(Long resumeId) throws Exception {
        resumeService.getResumeEntityById(resumeId);
        return projectRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId)
                .stream().map(ResumeMapper::toProjectResponse).collect(Collectors.toList());
    }

    @Override
    public ProjectResponse updateProject(Long resumeId, Long projectId, Long candidateId, AddProjectRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Project project = getEntityById(projectId, resumeId);

        project.setTitle(req.getTitle());
        if (req.getDescription() != null) project.setDescription(req.getDescription());
        if (req.getTechnologies() != null) project.setTechnologies(req.getTechnologies());
        if (req.getProjectUrl() != null) project.setProjectUrl(req.getProjectUrl());
        if (req.getSourceCodeUrl() != null) project.setSourceCodeUrl(req.getSourceCodeUrl());
        if (req.getStartDate() != null) project.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) project.setEndDate(req.getEndDate());
        if (req.getIsOngoing() != null) project.setIsOngoing(req.getIsOngoing());
        if (req.getDisplayOrder() != null) project.setDisplayOrder(req.getDisplayOrder());

        return ResumeMapper.toProjectResponse(projectRepository.save(project));
    }

    @Override
    public void deleteProject(Long resumeId, Long projectId, Long candidateId) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Project project = getEntityById(projectId, resumeId);
        projectRepository.delete(project);
    }

    private Project getEntityById(Long id, Long resumeId) throws Exception {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new Exception("Project not found with id: " + id));
        if (!project.getResume().getId().equals(resumeId))
            throw new Exception("Project does not belong to this resume");
        return project;
    }

    private void assertOwner(Resume resume, Long candidateId) throws Exception {
        if (!resume.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this resume");
    }
}
