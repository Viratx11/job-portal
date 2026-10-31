package com.virat.job.domain;

public enum CompanyStatus {
    PENDING_VERIFICATION,  // just registered, awaiting admin review
    ACTIVE,                // verified and operational
    SUSPENDED,             // temporarily blocked by admin
    REJECTED               // verification denied
}
