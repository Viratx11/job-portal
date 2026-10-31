package com.virat.job.service.impl;

import com.virat.job.dto.request.JobCategoryRequest;
import com.virat.job.dto.response.JobCategoryResponse;
import com.virat.job.mapper.JobMapper;
import com.virat.job.modal.JobCategory;
import com.virat.job.repository.JobCategoryRepository;
import com.virat.job.service.JobCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobCategoryServiceImpl implements JobCategoryService {

    private final JobCategoryRepository categoryRepository;

    @Override
    public JobCategoryResponse createCategory(JobCategoryRequest req) throws Exception {
        if (categoryRepository.existsByName(req.getName()))
            throw new Exception("Category '" + req.getName() + "' already exists");

        JobCategory parent = null;
        if (req.getParentId() != null)
            parent = getCategoryEntityById(req.getParentId());

        String slug = generateUniqueSlug(req.getName());

        JobCategory category = JobCategory.builder()
                .name(req.getName())
                .slug(slug)
                .description(req.getDescription())
                .iconUrl(req.getIconUrl())
                .parent(parent)
                .build();

        return JobMapper.toCategoryResponse(categoryRepository.save(category), true);
    }

    @Override
    public List<JobCategoryResponse> getAllCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(c -> JobMapper.toCategoryResponse(c, false))
                .collect(Collectors.toList());
    }

    @Override
    public List<JobCategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNullAndActiveTrue().stream()
                .map(c -> JobMapper.toCategoryResponse(c, true))
                .collect(Collectors.toList());
    }

    @Override
    public JobCategoryResponse getCategoryById(Long id) throws Exception {
        return JobMapper.toCategoryResponse(getCategoryEntityById(id), true);
    }

    @Override
    public JobCategoryResponse getCategoryBySlug(String slug) throws Exception {
        JobCategory category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new Exception("Category not found with slug: " + slug));
        return JobMapper.toCategoryResponse(category, true);
    }

    @Override
    public JobCategoryResponse updateCategory(Long id, JobCategoryRequest req) throws Exception {
        JobCategory category = getCategoryEntityById(id);

        if (!category.getName().equals(req.getName()) && categoryRepository.existsByName(req.getName()))
            throw new Exception("Category '" + req.getName() + "' already exists");

        JobCategory parent = null;
        if (req.getParentId() != null) {
            if (req.getParentId().equals(id))
                throw new Exception("A category cannot be its own parent");
            parent = getCategoryEntityById(req.getParentId());
        }

        category.setName(req.getName());
        category.setDescription(req.getDescription());
        category.setIconUrl(req.getIconUrl());
        category.setParent(parent);

        return JobMapper.toCategoryResponse(categoryRepository.save(category), true);
    }

    @Override
    public void deleteCategory(Long id) throws Exception {
        JobCategory category = getCategoryEntityById(id);
        category.setActive(false);
        categoryRepository.save(category);
    }

    @Override
    public JobCategory getCategoryEntityById(Long id) throws Exception {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new Exception("Job category not found with id: " + id));
    }

    private String generateUniqueSlug(String name) {
        String base = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-");
        if (!categoryRepository.existsBySlug(base)) return base;
        int counter = 1;
        while (categoryRepository.existsBySlug(base + "-" + counter)) counter++;
        return base + "-" + counter;
    }
}
