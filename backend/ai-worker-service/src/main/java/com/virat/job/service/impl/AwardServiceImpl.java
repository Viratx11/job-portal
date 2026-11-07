package com.virat.job.service.impl;

import com.virat.job.dto.request.AddAwardRequest;
import com.virat.job.dto.response.AwardResponse;
import com.virat.job.mapper.ResumeMapper;
import com.virat.job.modal.Award;
import com.virat.job.modal.Resume;
import com.virat.job.repository.AwardRepository;
import com.virat.job.service.AwardService;
import com.virat.job.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AwardServiceImpl implements AwardService {

    private final AwardRepository awardRepository;
    private final ResumeService resumeService;

    @Override
    public AwardResponse addAward(Long resumeId, Long candidateId, AddAwardRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        Award award = Award.builder()
                .resume(resume)
                .title(req.getTitle())
                .issuedBy(req.getIssuedBy())
                .awardDate(req.getAwardDate())
                .description(req.getDescription())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();

        Award saved = awardRepository.save(award);
        resumeService.syncResumeSummaryAndPdf(resumeId);
        return ResumeMapper.toAwardResponse(saved);
    }

    @Override
    public List<AwardResponse> getAwards(Long resumeId) throws Exception {
        resumeService.getResumeEntityById(resumeId);
        return awardRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId)
                .stream().map(ResumeMapper::toAwardResponse).collect(Collectors.toList());
    }

    @Override
    public AwardResponse updateAward(Long resumeId, Long awardId, Long candidateId, AddAwardRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Award award = getEntityById(awardId, resumeId);

        award.setTitle(req.getTitle());
        if (req.getIssuedBy() != null) award.setIssuedBy(req.getIssuedBy());
        if (req.getAwardDate() != null) award.setAwardDate(req.getAwardDate());
        if (req.getDescription() != null) award.setDescription(req.getDescription());
        if (req.getDisplayOrder() != null) award.setDisplayOrder(req.getDisplayOrder());

        Award saved = awardRepository.save(award);
        resumeService.syncResumeSummaryAndPdf(resumeId);
        return ResumeMapper.toAwardResponse(saved);
    }

    @Override
    public void deleteAward(Long resumeId, Long awardId, Long candidateId) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Award award = getEntityById(awardId, resumeId);
        awardRepository.delete(award);
        resumeService.syncResumeSummaryAndPdf(resumeId);
    }

    private Award getEntityById(Long id, Long resumeId) throws Exception {
        Award award = awardRepository.findById(id)
                .orElseThrow(() -> new Exception("Award not found with id: " + id));
        if (!award.getResume().getId().equals(resumeId))
            throw new Exception("Award does not belong to this resume");
        return award;
    }

    private void assertOwner(Resume resume, Long candidateId) throws Exception {
        if (!resume.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this resume");
    }
}
