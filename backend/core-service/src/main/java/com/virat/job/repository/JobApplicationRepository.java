package com.virat.job.repository;

import com.virat.job.modal.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long>,
        JpaSpecificationExecutor<JobApplication> {

    List<JobApplication> findByCandidateId(Long candidateId);

    List<JobApplication> findByJobId(Long jobId);

    List<JobApplication> findByCompanyId(Long companyId);

    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);
}
