package com.virat.job.repository;

import com.virat.job.modal.ResumeSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeSkillRepository extends JpaRepository<ResumeSkill, Long> {

    List<ResumeSkill> findByResume_IdOrderByDisplayOrderAsc(Long resumeId);

    void deleteByResume_Id(Long resumeId);

    boolean existsByResume_IdAndSkillNameIgnoreCase(Long resumeId, String skillName);
}
