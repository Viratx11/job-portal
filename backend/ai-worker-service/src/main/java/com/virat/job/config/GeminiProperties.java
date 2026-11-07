package com.virat.job.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "gemini.api")
public class GeminiProperties {

    private String key;
    private String model = "gemini-2.5-flash";
    private int maxOutputTokens = 2048;
    private double temperature = 0.7;
}
