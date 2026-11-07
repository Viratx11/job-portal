package com.virat.job.service.impl;

import com.virat.job.service.CompanyService;
import com.virat.job.domain.JobStatus;
import com.virat.job.dto.request.JobRequest;
import com.virat.job.dto.request.JobSearchRequest;
import com.virat.job.dto.response.CompanyResponse;
import com.virat.job.dto.response.JobResponse;
import com.virat.job.dto.response.JobSummaryResponse;
import com.virat.job.mapper.JobMapper;
import com.virat.job.modal.Job;
import com.virat.job.modal.JobCategory;
import com.virat.job.modal.JobSkill;
import com.virat.job.modal.JobTag;
import com.virat.job.modal.embeddable.JobLocation;
import com.virat.job.modal.embeddable.SalaryRange;
import com.virat.job.repository.JobRepository;
import com.virat.job.repository.JobSpecification;
import com.virat.job.service.JobCategoryService;
import com.virat.job.service.JobService;
import com.virat.job.service.JobSkillService;
import com.virat.job.service.JobTagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobCategoryService categoryService;
    private final JobSkillService skillService;
    private final JobTagService tagService;
    private final CompanyService companyService;

    @Override
    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public JobResponse createJob(Long employerId, JobRequest req) throws Exception {
        CompanyResponse company = companyService.getMyCompany(employerId);

        JobCategory category = categoryService.getCategoryEntityById(req.getCategoryId());

        Set<JobSkill> skills = req.getSkillIds() != null
                ? skillService.getSkillEntitiesByIds(req.getSkillIds()) : Collections.emptySet();
        Set<JobTag> tags = req.getTagIds() != null
                ? tagService.getTagEntitiesByIds(req.getTagIds()) : Collections.emptySet();

        Job job = Job.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .requirements(req.getRequirements())
                .responsibilities(req.getResponsibilities())
                .benefits(req.getBenefits())
                .companyId(company.getId())
                .employerId(employerId)
                .category(category)
                .skills(skills)
                .tags(tags)
                .location(buildLocation(req))
                .salaryRange(buildSalaryRange(req))
                .jobType(req.getJobType())
                .workMode(req.getWorkMode())
                .experienceLevel(req.getExperienceLevel())
                .openings(req.getOpenings() != null ? req.getOpenings() : 1)
                .applicationDeadline(req.getApplicationDeadline())
                .expiresAt(req.getExpiresAt())
                .build();

        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) throws Exception {
        return JobMapper.toResponse(getJobEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public JobSummaryResponse getJobSummaryById(Long id) throws Exception {
        return JobMapper.toSummaryResponse(getJobEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "jobs")
    public List<JobResponse> getJobs(JobSearchRequest req) {
        List<Job>res= jobRepository.findAll(JobSpecification.build(req));
        log.info("Jobs is of length"+res.size());
        return res.stream()
                .map(JobMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyIdAndActiveTrue(companyId).stream()
                .map(JobMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getJobsByEmployer(Long employerId) {
        return jobRepository.findByEmployerId(employerId).stream()
                .map(JobMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getJobsByCategory(Long categoryId) {
        return jobRepository.findByCategory_Id(categoryId).stream()
                .map(JobMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobsAdmin() {
        return jobRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(JobMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public JobResponse updateJob(Long jobId, Long employerId, JobRequest req) throws Exception {
        Job job = getJobEntityById(jobId);
        assertEmployer(job, employerId);

        JobCategory category = categoryService.getCategoryEntityById(req.getCategoryId());
        Set<JobSkill> skills = req.getSkillIds() != null
                ? skillService.getSkillEntitiesByIds(req.getSkillIds()) : Collections.emptySet();
        Set<JobTag> tags = req.getTagIds() != null
                ? tagService.getTagEntitiesByIds(req.getTagIds()) : Collections.emptySet();

        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setRequirements(req.getRequirements());
        job.setResponsibilities(req.getResponsibilities());
        job.setBenefits(req.getBenefits());
        job.setCategory(category);
        job.setSkills(skills);
        job.setTags(tags);
        job.setLocation(buildLocation(req));
        job.setSalaryRange(buildSalaryRange(req));
        job.setJobType(req.getJobType());
        job.setWorkMode(req.getWorkMode());
        job.setExperienceLevel(req.getExperienceLevel());
        job.setOpenings(req.getOpenings() != null ? req.getOpenings() : job.getOpenings());
        job.setApplicationDeadline(req.getApplicationDeadline());
        job.setExpiresAt(req.getExpiresAt());

        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public JobResponse publishJob(Long jobId, Long employerId) throws Exception {
        Job job = getJobEntityById(jobId);
        assertEmployer(job, employerId);
        if (job.getStatus() == JobStatus.CLOSED || job.getStatus() == JobStatus.EXPIRED)
            throw new Exception("Cannot publish a job with status: " + job.getStatus());
        job.setStatus(JobStatus.OPEN);
        job.setPublishedAt(LocalDateTime.now());
        job.setActive(true);
        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public JobResponse closeJob(Long jobId, Long employerId) throws Exception {
        Job job = getJobEntityById(jobId);
        assertEmployer(job, employerId);
        job.setStatus(JobStatus.CLOSED);
        job.setClosedAt(LocalDateTime.now());
        job.setActive(false);
        return JobMapper.toResponse(jobRepository.save(job));
    }

    @Override
    @Transactional
    @CacheEvict(value = "jobs", allEntries = true)
    public void deleteJob(Long jobId, Long employerId) throws Exception {
        Job job = getJobEntityById(jobId);
        assertEmployer(job, employerId);
        jobRepository.delete(job);
    }

    @Override
    @Transactional
    public void incrementViewCount(Long jobId) throws Exception {
        Job job = getJobEntityById(jobId);
        job.setViewCount(job.getViewCount() + 1);
        jobRepository.save(job);
    }

    @Override
    @Transactional
    public void incrementApplicationCount(Long jobId) throws Exception {
        Job job = getJobEntityById(jobId);
        job.setApplicationCount(job.getApplicationCount() + 1);
        jobRepository.save(job);
    }

    @Override
    public Job getJobEntityById(Long id) throws Exception {
        return jobRepository.findById(id)
                .orElseThrow(() -> new Exception("Job not found with id: " + id));
    }

    private void assertEmployer(Job job, Long employerId) throws Exception {
        if (!job.getEmployerId().equals(employerId))
            throw new Exception("You are not the employer who posted this job");
    }

    private JobLocation buildLocation(JobRequest req) {
        return JobLocation.builder()
                .address(req.getAddress())
                .city(req.getCity())
                .state(req.getState())
                .country(req.getCountry())
                .zipCode(req.getZipCode())
                .build();
    }

    private SalaryRange buildSalaryRange(JobRequest req) {
        return SalaryRange.builder()
                .minSalary(req.getMinSalary())
                .maxSalary(req.getMaxSalary())
                .currency(req.getCurrency())
                .period(req.getSalaryPeriod())
                .negotiable(req.getSalaryNegotiable())
                .disclosed(req.getSalaryDisclosed())
                .build();
    }
}
