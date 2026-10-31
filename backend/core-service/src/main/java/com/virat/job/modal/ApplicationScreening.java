package com.virat.job.modal;

import com.virat.job.domain.AiShortlistStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "application_screenings",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_screening_application",
                columnNames = "application_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationScreening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_id", nullable = false, unique = true)
    private Long applicationId;

    @Column(nullable = false)
    private Integer overallScore;

    private Integer skillsMatchScore;

    private Integer experienceMatchScore;

    private Integer educationMatchScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AiShortlistStatus shortlistStatus;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "screening_matched_skills",
            joinColumns = @JoinColumn(name = "screening_id"))
    @Column(name = "skill")
    private List<String> matchedSkills;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "screening_missing_skills",
            joinColumns = @JoinColumn(name = "screening_id"))
    @Column(name = "skill")
    private List<String> missingSkills;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "screening_strengths",
            joinColumns = @JoinColumn(name = "screening_id"))
    @Column(name = "strength", columnDefinition = "TEXT")
    private List<String> strengths;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "screening_concerns",
            joinColumns = @JoinColumn(name = "screening_id"))
    @Column(name = "concern", columnDefinition = "TEXT")
    private List<String> concerns;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isStale = false;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime screenedAt;

    @Column(length = 50)
    @Builder.Default
    private String screeningVersion = "v1";
}
