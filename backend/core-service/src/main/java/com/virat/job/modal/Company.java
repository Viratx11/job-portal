package com.virat.job.modal;

import com.virat.job.domain.CompanySize;
import com.virat.job.domain.CompanyStatus;
import com.virat.job.domain.CompanyType;
import com.virat.job.domain.IndustryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@Table(name="companies")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true,nullable = false)
    private String name;

    @Column(unique=true)
    private String slug;

    private String tagLine;

    private String description;

    private  String logoUrl;

    private String coverImageUrl;

    private String website;

    private String email;
    private String phone;

    private Integer foundedYear;

    @Enumerated(EnumType.STRING)
    private CompanySize companySize;

    @Enumerated(EnumType.STRING)
    private CompanyType companyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IndustryType industryType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CompanyStatus status = CompanyStatus.PENDING_VERIFICATION;

    /** Official registration / CIN number for verification. */
    @Column(unique = true)
    private String registrationNumber;

    /**
     * ID of the employer user who owns this company profile (from user-service).
     * Plain Long — no cross-service FK. Unique: one user can own only one company.
     */
    @Column(nullable = false, unique = true)
    private Long ownerId;

    /**
     * Social and web links (LinkedIn, GitHub, Twitter, etc.).
     * Stored in a separate collection table — no independent lifecycle needed.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "company_social_links",
            joinColumns = @JoinColumn(name = "company_id")
    )
    @Builder.Default
    private List<SocialLink> socialLinks = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    private boolean isVerified=false;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime verifiedAt;

}
