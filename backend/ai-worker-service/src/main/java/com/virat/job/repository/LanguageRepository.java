package com.virat.job.repository;

import com.virat.job.modal.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LanguageRepository extends JpaRepository<Language, Long> {

    List<Language> findByResume_IdOrderByDisplayOrderAsc(Long resumeId);

    void deleteByResume_Id(Long resumeId);
}
