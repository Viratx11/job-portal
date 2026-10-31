package com.virat.job.service.impl;

import com.virat.job.dto.request.ParseResumeRequest;
import com.virat.job.dto.response.ResumeParseJobResponse;
import com.virat.job.modal.ResumeParseJob;
import com.virat.job.repository.ResumeParseJobRepository;
import com.virat.job.service.ResumeParseJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeParseJobServiceImpl implements ResumeParseJobService {

    private final ResumeParseJobRepository parseJobRepository;

    @Override
    public ResumeParseJobResponse createParseJob(Long candidateId, ParseResumeRequest req) throws Exception {
        ResumeParseJob job = ResumeParseJob.builder()
                .candidateId(candidateId)
                .resumeId(req.getResumeId())
                .originalFileUrl(req.getFileUrl())
                .originalFileName(req.getFileName())
                .fileType(req.getFileType())
                .build();

        return toResponse(parseJobRepository.save(job));
    }

    @Override
    public ResumeParseJobResponse getParseJob(Long parseJobId, Long candidateId) throws Exception {
        ResumeParseJob job = parseJobRepository.findById(parseJobId)
                .orElseThrow(() -> new Exception("Parse job not found with id: " + parseJobId));
        if (!job.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this parse job");
        return toResponse(job);
    }

    @Override
    public List<ResumeParseJobResponse> getMyParseJobs(Long candidateId) {
        return parseJobRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ResumeParseJobResponse toResponse(ResumeParseJob job) {
        return ResumeParseJobResponse.builder()
                .id(job.getId())
                .candidateId(job.getCandidateId())
                .resumeId(job.getResumeId())
                .originalFileName(job.getOriginalFileName())
                .fileType(job.getFileType())
                .status(job.getStatus())
                .parsedData(job.getParsedData())
                .failureReason(job.getFailureReason())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
