package com.virat.job.repository;

import com.virat.job.domain.JobStatus;
import com.virat.job.dto.request.JobSearchRequest;
import com.virat.job.modal.Job;
import com.virat.job.modal.JobSkill;
import com.virat.job.modal.JobTag;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    private JobSpecification() {}

    public static Specification<Job> build(JobSearchRequest req) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("active")));

            JobStatus status = req.getStatus() != null ? req.getStatus() : JobStatus.OPEN;
            predicates.add(cb.equal(root.get("status"), status));

            if (req.getJobType() != null)
                predicates.add(cb.equal(root.get("jobType"), req.getJobType()));
            if (req.getWorkMode() != null)
                predicates.add(cb.equal(root.get("workMode"), req.getWorkMode()));
            if (req.getExperienceLevel() != null)
                predicates.add(cb.equal(root.get("experienceLevel"), req.getExperienceLevel()));
            if (req.getCompanyId() != null)
                predicates.add(cb.equal(root.get("companyId"), req.getCompanyId()));
            if (req.getCategoryId() != null)
                predicates.add(cb.equal(root.get("category").get("id"), req.getCategoryId()));

            // Separate city / state / country filters
            if (req.getCity() != null && !req.getCity().isBlank())
                predicates.add(cb.like(cb.lower(root.get("location").get("city")),
                        "%" + req.getCity().toLowerCase() + "%"));

            if (req.getState() != null && !req.getState().isBlank())
                predicates.add(cb.like(cb.lower(root.get("location").get("state")),
                        "%" + req.getState().toLowerCase() + "%"));

            if (req.getCountry() != null && !req.getCountry().isBlank())
                predicates.add(cb.like(cb.lower(root.get("location").get("country")),
                        "%" + req.getCountry().toLowerCase() + "%"));

            if (req.getMinSalary() != null)
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("salaryRange").get("maxSalary"), req.getMinSalary()));
            if (req.getMaxSalary() != null)
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("salaryRange").get("minSalary"), req.getMaxSalary()));

            if (req.getMinOpenings() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("openings"), req.getMinOpenings()));
            if (req.getMaxOpenings() != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("openings"), req.getMaxOpenings()));

            if (req.getSkillIds() != null && !req.getSkillIds().isEmpty()) {
                Join<Job, JobSkill> skillJoin = root.join("skills", JoinType.INNER);
                predicates.add(skillJoin.get("id").in(req.getSkillIds()));
                query.distinct(true);
            }

            if (req.getTagIds() != null && !req.getTagIds().isEmpty()) {
                Join<Job, JobTag> tagJoin = root.join("tags", JoinType.INNER);
                predicates.add(tagJoin.get("id").in(req.getTagIds()));
                query.distinct(true);
            }

            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                String pattern = "%" + req.getKeyword().toLowerCase() + "%";

                Subquery<Long> skillSub = query.subquery(Long.class);
                Root<Job> skillJobRoot = skillSub.from(Job.class);
                Join<Job, JobSkill> skillSubJoin = skillJobRoot.join("skills", JoinType.INNER);
                skillSub.select(skillJobRoot.get("id"))
                        .where(cb.and(
                                cb.equal(skillJobRoot.get("id"), root.get("id")),
                                cb.like(cb.lower(skillSubJoin.get("name")), pattern)
                        ));

                Subquery<Long> tagSub = query.subquery(Long.class);
                Root<Job> tagJobRoot = tagSub.from(Job.class);
                Join<Job, JobTag> tagSubJoin = tagJobRoot.join("tags", JoinType.INNER);
                tagSub.select(tagJobRoot.get("id"))
                        .where(cb.and(
                                cb.equal(tagJobRoot.get("id"), root.get("id")),
                                cb.like(cb.lower(tagSubJoin.get("name")), pattern)
                        ));

                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.exists(skillSub),
                        cb.exists(tagSub)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
