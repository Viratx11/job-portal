package com.virat.job.repository;

import com.virat.job.modal.ApplicationNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationNoteRepository extends JpaRepository<ApplicationNote, Long> {

    List<ApplicationNote> findByApplicationIdOrderByCreatedAtDesc(Long applicationId);
}
