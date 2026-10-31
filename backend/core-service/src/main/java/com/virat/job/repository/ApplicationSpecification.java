package com.virat.job.repository;

import com.virat.job.domain.AiShortlistStatus;
import com.virat.job.domain.ApplicationSource;
import com.virat.job.domain.ApplicationStatus;
import com.virat.job.modal.JobApplication;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ApplicationSpecification {

    public static Specification<JobApplication> forCompanyWithFilters(
            Long companyId,
            Long jobId,
            ApplicationStatus status,
            ApplicationSource source,
            Boolean isRead,
            Boolean isStarred,
            LocalDateTime appliedFrom,
            LocalDateTime appliedTo,
            AiShortlistStatus aiShortlistStatus,
            Integer minAiScore
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("companyId"), companyId));

            if (jobId != null)             predicates.add(cb.equal(root.get("jobId"), jobId));
            if (status != null)            predicates.add(cb.equal(root.get("status"), status));
            if (source != null)            predicates.add(cb.equal(root.get("source"), source));
            if (isRead != null)            predicates.add(cb.equal(root.get("isRead"), isRead));
            if (isStarred != null)         predicates.add(cb.equal(root.get("isStarred"), isStarred));
            if (appliedFrom != null)       predicates.add(cb.greaterThanOrEqualTo(root.get("appliedAt"), appliedFrom));
            if (appliedTo != null)         predicates.add(cb.lessThanOrEqualTo(root.get("appliedAt"), appliedTo));
            if (aiShortlistStatus != null) predicates.add(cb.equal(root.get("aiShortlistStatus"), aiShortlistStatus));
            if (minAiScore != null)        predicates.add(cb.greaterThanOrEqualTo(root.get("aiScore"), minAiScore));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
