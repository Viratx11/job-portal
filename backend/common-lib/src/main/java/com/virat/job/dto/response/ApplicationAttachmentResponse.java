package com.virat.job.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationAttachmentResponse {
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSizeBytes;
}
