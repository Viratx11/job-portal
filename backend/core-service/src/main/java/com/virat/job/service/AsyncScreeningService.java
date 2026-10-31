package com.virat.job.service;

import com.virat.job.modal.JobApplication;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncScreeningService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publishes an event to Kafka so ai-worker-service can asynchronously
     * fetch the resume, score the candidate with Gemini, and persist the screening result.
     */
    @Async
    public void runScreeningAsync(JobApplication application) {
        Long applicationId = application.getId();
        log.info("[AI Screening] Dispatching Kafka screening event for application {}", applicationId);

        try {
            String payload = String.format(
                "{\"applicationId\":%d,\"jobId\":%d,\"candidateId\":%d,\"resumeId\":%d}",
                application.getId(),
                application.getJobId(),
                application.getCandidateId(),
                application.getResumeId()
            );
            kafkaTemplate.send("application-screening-events", String.valueOf(applicationId), payload);
        } catch (Exception e) {
            log.error("[AI Screening] Failed to dispatch event for application {}: {}", applicationId, e.getMessage(), e);
        }
    }
}