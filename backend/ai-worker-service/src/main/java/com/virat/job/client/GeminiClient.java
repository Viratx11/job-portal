package com.virat.job.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.virat.job.config.GeminiProperties;
import com.virat.job.security.PromptInjectionSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final Client genAiClient;
    private final GeminiProperties props;
    private final ObjectMapper objectMapper;

    public String generateText(String systemInstruction, String prompt) {
        return callText(systemInstruction, prompt,
                (float) props.getTemperature(), props.getMaxOutputTokens());
    }

    public <T> T generateJson(String systemInstruction, String prompt, Class<T> responseType) {
        return callJson(systemInstruction, prompt, responseType);
    }

    private Set<String> candidateModels() {
        Set<String> models = new LinkedHashSet<>();
        if (props.getModel() != null && !props.getModel().isBlank()) {
            models.add(props.getModel());
        }
        models.addAll(List.of("gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-pro"));
        return models;
    }

    private GenerateContentResponse callWithTimeout(String modelName, String prompt, GenerateContentConfig config) throws Exception {
        return CompletableFuture.supplyAsync(() ->
                genAiClient.models.generateContent(modelName, prompt, config)
        ).get(8, TimeUnit.SECONDS);
    }

    private String callText(String systemInstruction, String prompt, float temperature, int maxTokens) {
        GenerateContentConfig config = buildConfig(systemInstruction, temperature, maxTokens, false);
        Exception lastError = null;
        for (String modelName : candidateModels()) {
            try {
                GenerateContentResponse response = callWithTimeout(modelName, prompt, config);
                String text = response.text();
                if (text != null && !text.isBlank()) {
                    log.debug("Gemini response received from {}, length: {}", modelName, text.length());
                    return text;
                }
            } catch (Exception e) {
                lastError = e;
                log.warn("Gemini text generation failed with model {}: {}", modelName, e.getMessage());
            }
        }
        log.error("Error calling Gemini API across all candidate models: {}",
                lastError != null ? lastError.getMessage() : "unknown");
        return buildTextFallback(prompt);
    }

    private <T> T callJson(String systemInstruction, String prompt, Class<T> responseType) {
        GenerateContentConfig config = buildConfig(systemInstruction, 0.3f, props.getMaxOutputTokens(), true);
        Exception lastError = null;
        for (String modelName : candidateModels()) {
            try {
                GenerateContentResponse response = callWithTimeout(modelName, prompt, config);
                String raw = stripMarkdownFences(response.text());
                return objectMapper.readValue(raw, responseType);
            } catch (Exception e) {
                lastError = e;
                log.warn("Gemini JSON generation failed with model {}: {}", modelName, e.getMessage());
            }
        }
        log.error("Failed to parse Gemini JSON response across candidate models: {}",
                lastError != null ? lastError.getMessage() : "unknown");
        return buildJsonFallback(prompt, responseType);
    }

    private String stripMarkdownFences(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > 0) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3);
            }
        }
        return trimmed.trim();
    }

    private String buildTextFallback(String prompt) {
        return null;
    }

    private <T> T buildJsonFallback(String prompt, Class<T> responseType) {
        try {
            if (prompt != null) {
                int start = prompt.indexOf('{');
                int end = prompt.lastIndexOf('}');
                if (start >= 0 && end > start) {
                    String candidateJson = prompt.substring(start, end + 1);
                    return objectMapper.readValue(candidateJson, responseType);
                }
            }
            return objectMapper.readValue("{}", responseType);
        } catch (Exception ex) {
            throw new RuntimeException("AI returned invalid JSON. Please try again.");
        }
    }

    private GenerateContentConfig buildConfig(String systemInstruction, float temperature, int maxTokens, boolean jsonMode) {
        GenerateContentConfig.Builder builder = GenerateContentConfig.builder()
                .temperature(temperature)
                .maxOutputTokens(maxTokens);

        if (systemInstruction != null && !systemInstruction.isBlank()) {
            String hardenedInstruction = systemInstruction + PromptInjectionSanitizer.SECURITY_GUARDRAIL_SYSTEM_SUFFIX;
            builder.systemInstruction(Content.fromParts(Part.fromText(hardenedInstruction)));
        } else {
            builder.systemInstruction(Content.fromParts(Part.fromText(PromptInjectionSanitizer.SECURITY_GUARDRAIL_SYSTEM_SUFFIX)));
        }
        if (jsonMode) {
            builder.responseMimeType("application/json");
        }
        return builder.build();
    }
}
