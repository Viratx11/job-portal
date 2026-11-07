package com.virat.job.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.scripting.support.ResourceScriptSource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationSlotLockService {

    private final StringRedisTemplate redisTemplate;
    private DefaultRedisScript<Long> slotLockScript;

    @PostConstruct
    public void init() {
        slotLockScript = new DefaultRedisScript<>();
        slotLockScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("apply_slot_lock.lua")));
        slotLockScript.setResultType(Long.class);
    }

    // Atomic Redis Lua check-and-decrement so concurrent applicants cannot overbook slots
    public boolean acquireSlot(Long jobId, int initialOpenings) {
        String key = "job:slots:" + jobId;
        try {
            Long result = redisTemplate.execute(
                slotLockScript,
                Collections.singletonList(key),
                "0",
                String.valueOf(initialOpenings)
            );

            if (result != null && result >= 0) {
                log.info("Acquired slot for job {}. Remaining: {}", jobId, result);
                return true;
            }

            log.warn("Application rejected for job {} - no slots remaining.", jobId);
            return false;
        } catch (Exception e) {
            log.warn("Redis unavailable for slot lock on job {}, falling back to DB openings check: {}", jobId, e.getMessage());
            return initialOpenings > 0;
        }
    }

    public void releaseSlot(Long jobId) {
        if (jobId == null) return;
        String key = "job:slots:" + jobId;
        try {
            if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
                Long updated = redisTemplate.opsForValue().increment(key);
                log.info("Released slot for job {}. Available: {}", jobId, updated);
            }
        } catch (Exception e) {
            log.warn("Failed to release Redis slot for job {}: {}", jobId, e.getMessage());
        }
    }
}