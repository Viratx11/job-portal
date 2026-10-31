package com.virat.job.modal.embeddable;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationAttachment {

    private String fileUrl;

    private String fileName;

    private String fileType;

    private Long fileSizeBytes;
}
