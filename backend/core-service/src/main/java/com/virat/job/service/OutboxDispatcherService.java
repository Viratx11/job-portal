package com.virat.job.service;

import com.virat.job.modal.OutboxEvent;
import com.virat.job.repository.OutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxDispatcherService {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    private static final String TOPIC = "job-events-topic";

    @Scheduled(fixedDelay = 3000) 
    @Transactional
    public void dispatchOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findByProcessedFalseOrderByCreatedAtAsc();

        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info("Found {} unprocessed outbox events to dispatch to Kafka.", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                kafkaTemplate.send(TOPIC, String.valueOf(event.getAggregateId()), event.getPayload())
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            event.setProcessed(true);
                            outboxRepository.save(event);
                            log.info("Successfully dispatched outbox event ID {} to Kafka topic {}", event.getId(), TOPIC);
                        } else {
                            log.error("Failed to dispatch outbox event ID {} to Kafka", event.getId(), ex);
                        }
                    });
            } catch (Exception e) {
                log.error("Error sending outbox event ID {} to Kafka", event.getId(), e);
            }
        }
    }
}