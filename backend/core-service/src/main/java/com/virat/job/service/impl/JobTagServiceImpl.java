package com.virat.job.service.impl;

import com.virat.job.dto.request.JobTagRequest;
import com.virat.job.dto.response.JobTagResponse;
import com.virat.job.mapper.JobMapper;
import com.virat.job.modal.JobTag;
import com.virat.job.repository.JobTagRepository;
import com.virat.job.service.JobTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobTagServiceImpl implements JobTagService {

    private final JobTagRepository tagRepository;

    @Override
    public JobTagResponse createTag(JobTagRequest req) throws Exception {
        if (tagRepository.existsByName(req.getName()))
            throw new Exception("Tag '" + req.getName() + "' already exists");

        String slug = generateUniqueSlug(req.getName());
        JobTag tag = JobTag.builder()
                .name(req.getName())
                .slug(slug)
                .build();

        return JobMapper.toTagResponse(tagRepository.save(tag));
    }

    @Override
    public List<JobTagResponse> getAllTags() {
        return tagRepository.findAll().stream()
                .map(JobMapper::toTagResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobTagResponse> searchTags(String keyword) {
        return tagRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(JobMapper::toTagResponse)
                .collect(Collectors.toList());
    }

    @Override
    public JobTagResponse getTagById(Long id) throws Exception {
        return JobMapper.toTagResponse(getTagEntityById(id));
    }

    @Override
    public JobTagResponse updateTag(Long id, JobTagRequest req) throws Exception {
        JobTag tag = getTagEntityById(id);
        if (!tag.getName().equals(req.getName()) && tagRepository.existsByName(req.getName()))
            throw new Exception("Tag '" + req.getName() + "' already exists");

        tag.setName(req.getName());
        return JobMapper.toTagResponse(tagRepository.save(tag));
    }

    @Override
    public void deleteTag(Long id) throws Exception {
        tagRepository.delete(getTagEntityById(id));
    }

    @Override
    public Set<JobTag> getTagEntitiesByIds(Set<Long> ids) throws Exception {
        Set<JobTag> tags = new HashSet<>(tagRepository.findAllById(ids));
        if (tags.size() != ids.size())
            throw new Exception("One or more tag IDs are invalid");
        return tags;
    }

    private JobTag getTagEntityById(Long id) throws Exception {
        return tagRepository.findById(id)
                .orElseThrow(() -> new Exception("Tag not found with id: " + id));
    }

    private String generateUniqueSlug(String name) {
        String base = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
        if (!tagRepository.existsBySlug(base)) return base;
        int counter = 1;
        while (tagRepository.existsBySlug(base + "-" + counter)) counter++;
        return base + "-" + counter;
    }
}
