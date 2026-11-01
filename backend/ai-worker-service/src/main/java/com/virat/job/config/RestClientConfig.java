package com.virat.job.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.genai.Client;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RestClientConfig {

    @Bean
    public Client genAiClient(GeminiProperties props) {
        String apiKey = (props.getKey() != null && !props.getKey().isBlank())
                ? props.getKey()
                : System.getenv().getOrDefault("GEMINI_API_KEY", "dummy-local-dev-key");
        return Client.builder()
                .apiKey(apiKey)
                .build();
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}
