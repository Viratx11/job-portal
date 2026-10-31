package com.virat.job.repository;

import com.virat.job.domain.ParseStatus;
import com.virat.job.modal.ResumeParseJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeParseJobRepository extends JpaRepository<ResumeParseJob, Long> {

    List<ResumeParseJob> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);

    List<ResumeParseJob> findByStatus(ParseStatus status);
}
