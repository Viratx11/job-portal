package com.virat.job.dto.request;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateApplicationRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotNull(message = "Resume ID is required")
    private Long resumeId;

    @Size(max = 20000, message = "Cover letter must not exceed 20000 characters")
    private String coverLetter;

    @DecimalMin(value = "0.0", message = "Expected salary must not be negative")
    private BigDecimal expectedSalary;

    @JsonDeserialize(using = LenientLocalDateDeserializer.class)
    private LocalDate availableFrom;

    public static class LenientLocalDateDeserializer extends JsonDeserializer<LocalDate> {
        @Override
        public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            String text = p.getText();
            if (text == null || text.isBlank() || text.equalsIgnoreCase("null")) {
                return null;
            }
            String trimmed = text.trim();
            if (trimmed.equalsIgnoreCase("immediately") || trimmed.equalsIgnoreCase("immediate") || trimmed.equalsIgnoreCase("asap") || trimmed.equalsIgnoreCase("now")) {
                return LocalDate.now();
            }
            try {
                return LocalDate.parse(trimmed, DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (Exception e) {
                try {
                    return LocalDate.parse(trimmed.split("T")[0]);
                } catch (Exception ignored) {
                    return LocalDate.now();
                }
            }
        }
    }
}
