package com.virat.job.service;

import com.virat.job.dto.request.AddCertificationRequest;
import com.virat.job.dto.response.CertificationResponse;

import java.util.List;

public interface CertificationService {
    CertificationResponse addCertification(Long resumeId, Long candidateId, AddCertificationRequest req) throws Exception;
    List<CertificationResponse> getCertifications(Long resumeId) throws Exception;
    CertificationResponse updateCertification(Long resumeId, Long certId, Long candidateId, AddCertificationRequest req) throws Exception;
    void deleteCertification(Long resumeId, Long certId, Long candidateId) throws Exception;
}
