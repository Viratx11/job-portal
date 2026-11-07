package com.virat.job.repository;

import com.virat.job.modal.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OutboxRepository extends JpaRepository<OutboxEvent, Long> {
    List<OutboxEvent> findByProcessedFalseOrderByCreatedAtAsc();
}