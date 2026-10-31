package com.virat.job.modal;

import com.virat.job.domain.ResumeTemplate;
import com.virat.job.domain.ResumeVisibility;
import com.virat.job.modal.embeddable.PersonalInfo;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ResumeTemplate template = ResumeTemplate.PROFESSIONAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ResumeVisibility visibility = ResumeVisibility.PRIVATE;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @Embedded
    private PersonalInfo personalInfo;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private String uploadedFileUrl;
    private String uploadedFileName;

    @Column(nullable = false)
    @Builder.Default
    private Integer completionScore = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    private LocalDateTime lastViewedAt;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
