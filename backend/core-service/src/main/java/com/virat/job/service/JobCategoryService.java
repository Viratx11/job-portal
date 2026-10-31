package com.virat.job.service;


import com.virat.job.dto.request.JobCategoryRequest;
import com.virat.job.dto.response.JobCategoryResponse;
import com.virat.job.modal.JobCategory;

import java.util.List;

public interface JobCategoryService {
    JobCategoryResponse createCategory(JobCategoryRequest req) throws Exception;

    List<JobCategoryResponse> getAllCategories();

    List<JobCategoryResponse> getRootCategories();

    JobCategoryResponse getCategoryById(Long id) throws Exception;

    JobCategoryResponse getCategoryBySlug(String slug) throws Exception;

    JobCategoryResponse updateCategory(Long id, JobCategoryRequest req) throws Exception;

    void deleteCategory(Long id) throws Exception;

    JobCategory getCategoryEntityById(Long id) throws Exception;
}
