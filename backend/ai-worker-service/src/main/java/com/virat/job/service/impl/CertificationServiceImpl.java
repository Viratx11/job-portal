package com.virat.job.service.impl;

import com.virat.job.dto.request.AddCertificationRequest;
import com.virat.job.dto.response.CertificationResponse;
import com.virat.job.mapper.ResumeMapper;
import com.virat.job.modal.Certification;
import com.virat.job.modal.Resume;
import com.virat.job.repository.CertificationRepository;
import com.virat.job.service.CertificationService;
import com.virat.job.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificationServiceImpl implements CertificationService {

    private final CertificationRepository certificationRepository;
    private final ResumeService resumeService;

    @Override
    public CertificationResponse addCertification(Long resumeId, Long candidateId, AddCertificationRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        Certification cert = Certification.builder()
                .resume(resume)
                .name(req.getName())
                .issuingOrganization(req.getIssuingOrganization())
                .issueDate(req.getIssueDate())
                .expiryDate(req.getExpiryDate())
                .credentialId(req.getCredentialId())
                .credentialUrl(req.getCredentialUrl())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();

        return ResumeMapper.toCertificationResponse(certificationRepository.save(cert));
    }

    @Override
    public List<CertificationResponse> getCertifications(Long resumeId) throws Exception {
        resumeService.getResumeEntityById(resumeId);
        return certificationRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId)
                .stream().map(ResumeMapper::toCertificationResponse).collect(Collectors.toList());
    }

    @Override
    public CertificationResponse updateCertification(Long resumeId, Long certId, Long candidateId, AddCertificationRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Certification cert = getEntityById(certId, resumeId);

        cert.setName(req.getName());
        cert.setIssuingOrganization(req.getIssuingOrganization());
        cert.setIssueDate(req.getIssueDate());
        if (req.getExpiryDate() != null) cert.setExpiryDate(req.getExpiryDate());
        if (req.getCredentialId() != null) cert.setCredentialId(req.getCredentialId());
        if (req.getCredentialUrl() != null) cert.setCredentialUrl(req.getCredentialUrl());
        if (req.getDisplayOrder() != null) cert.setDisplayOrder(req.getDisplayOrder());

        return ResumeMapper.toCertificationResponse(certificationRepository.save(cert));
    }

    @Override
    public void deleteCertification(Long resumeId, Long certId, Long candidateId) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Certification cert = getEntityById(certId, resumeId);
        certificationRepository.delete(cert);
    }

    private Certification getEntityById(Long id, Long resumeId) throws Exception {
        Certification cert = certificationRepository.findById(id)
                .orElseThrow(() -> new Exception("Certification not found with id: " + id));
        if (!cert.getResume().getId().equals(resumeId))
            throw new Exception("Certification does not belong to this resume");
        return cert;
    }

    private void assertOwner(Resume resume, Long candidateId) throws Exception {
        if (!resume.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this resume");
    }
}
