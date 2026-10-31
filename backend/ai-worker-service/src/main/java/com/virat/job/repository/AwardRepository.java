package com.virat.job.repository;

import com.virat.job.modal.Award;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AwardRepository extends JpaRepository<Award, Long> {

    List<Award> findByResume_IdOrderByDisplayOrderAsc(Long resumeId);

    void deleteByResume_Id(Long resumeId);

}
