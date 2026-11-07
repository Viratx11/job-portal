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

    private String formatProjectTitle(String title) {
        if (title == null || title.isBlank()) return "Engineering Project";
        String trimmed = title.trim();
        // If all-lowercase, capitalize each word or camel-case
        if (trimmed.equals(trimmed.toLowerCase())) {
            StringBuilder sb = new StringBuilder();
            for (String word : trimmed.split("[-_\\s]+")) {
                if (!word.isEmpty()) {
                    sb.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1)).append(" ");
                }
            }
            return sb.toString().trim();
        }
        return trimmed;
    }

    private String cleanProjectDescription(String desc) {
        if (desc == null || desc.isBlank()) return "";
        // Strip out casual disclaimers like "(i built it for fun, i'm not responsible if anything goes wrong)"
        return desc.replaceAll("(?i)\\([\\s]*i\\s+(?:built|made|wrote)\\s+it\\s+for\\s+fun[^)]*\\)", "")
                   .replaceAll("(?i)\\([\\s]*(?:i'm\\s+not|not)\\s+responsible[^)]*\\)", "")
                   .replaceAll("(?i)\\s{2,}", " ")
                   .trim();
    }

    @Override
    public ProjectResponse addProject(Long resumeId, Long candidateId, AddProjectRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        List<String> techs = req.getResolvedTechnologies();
        String projUrl = req.getResolvedProjectUrl();
        String srcUrl = req.getResolvedSourceCodeUrl();

        if (projUrl != null && projUrl.toLowerCase().contains("github.com") && srcUrl == null) {
            srcUrl = projUrl;
            projUrl = null;
        } else if (projUrl != null && projUrl.equalsIgnoreCase(srcUrl)) {
            projUrl = null;
        }

        Project project = Project.builder()
                .resume(resume)
                .title(formatProjectTitle(req.getTitle()))
                .description(cleanProjectDescription(req.getDescription()))
                .technologies(techs)
                .projectUrl(projUrl)
                .sourceCodeUrl(srcUrl)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isOngoing(req.getIsOngoing() != null ? req.getIsOngoing() : false)
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();

        Project saved = projectRepository.save(project);
        resumeService.syncResumeSummaryAndPdf(resumeId);
        return ResumeMapper.toProjectResponse(saved);
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

        if (req.getTitle() != null) project.setTitle(formatProjectTitle(req.getTitle()));
        if (req.getDescription() != null) project.setDescription(cleanProjectDescription(req.getDescription()));
        
        List<String> techs = req.getResolvedTechnologies();
        if (!techs.isEmpty()) {
            project.setTechnologies(techs);
        } else if (req.getTechnologies() != null) {
            project.setTechnologies(req.getTechnologies());
        }

        String projUrl = req.getResolvedProjectUrl();
        String srcUrl = req.getResolvedSourceCodeUrl();
        if (projUrl != null && projUrl.toLowerCase().contains("github.com") && srcUrl == null) {
            srcUrl = projUrl;
            projUrl = null;
        } else if (projUrl != null && projUrl.equalsIgnoreCase(srcUrl)) {
            projUrl = null;
        }
        if (projUrl != null) project.setProjectUrl(projUrl);
        if (srcUrl != null) project.setSourceCodeUrl(srcUrl);

        if (req.getStartDate() != null) project.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) project.setEndDate(req.getEndDate());
        if (req.getIsOngoing() != null) project.setIsOngoing(req.getIsOngoing());
        if (req.getDisplayOrder() != null) project.setDisplayOrder(req.getDisplayOrder());

        Project saved = projectRepository.save(project);
        resumeService.syncResumeSummaryAndPdf(resumeId);
        return ResumeMapper.toProjectResponse(saved);
    }

    @Override
    public void deleteProject(Long resumeId, Long projectId, Long candidateId) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Project project = getEntityById(projectId, resumeId);
        projectRepository.delete(project);
        resumeService.syncResumeSummaryAndPdf(resumeId);
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
