package com.virat.job.modal;

import com.virat.job.domain.AiShortlistStatus;
import com.virat.job.domain.ApplicationSource;
import com.virat.job.domain.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "applications",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_candidate_job",
                columnNames = {"candidate_id", "job_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private Long employerId;

    @Column(nullable = false)
    private Long resumeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    private BigDecimal expectedSalary;

    private LocalDate availableFrom;

    @Enumerated(EnumType.STRING)
    private ApplicationSource source;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isStarred = false;

    @Column
    private Integer aiScore;

    @Enumerated(EnumType.STRING)
    @Column
    @Builder.Default
    private AiShortlistStatus aiShortlistStatus = AiShortlistStatus.NOT_SCREENED;

    private LocalDateTime withdrawnAt;

    @Column(columnDefinition = "TEXT")
    private String withdrawnReason;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime appliedAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
