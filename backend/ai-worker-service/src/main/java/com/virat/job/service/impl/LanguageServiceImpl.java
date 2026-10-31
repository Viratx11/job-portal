package com.virat.job.service.impl;

import com.virat.job.dto.request.AddLanguageRequest;
import com.virat.job.dto.response.LanguageResponse;
import com.virat.job.mapper.ResumeMapper;
import com.virat.job.modal.Language;
import com.virat.job.modal.Resume;
import com.virat.job.repository.LanguageRepository;
import com.virat.job.service.LanguageService;
import com.virat.job.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LanguageServiceImpl implements LanguageService {

    private final LanguageRepository languageRepository;
    private final ResumeService resumeService;

    @Override
    public LanguageResponse addLanguage(Long resumeId, Long candidateId, AddLanguageRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);

        Language language = Language.builder()
                .resume(resume)
                .languageName(req.getLanguageName())
                .proficiency(req.getProficiency())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();

        return ResumeMapper.toLanguageResponse(languageRepository.save(language));
    }

    @Override
    public List<LanguageResponse> getLanguages(Long resumeId) throws Exception {
        resumeService.getResumeEntityById(resumeId);
        return languageRepository.findByResume_IdOrderByDisplayOrderAsc(resumeId)
                .stream().map(ResumeMapper::toLanguageResponse).collect(Collectors.toList());
    }

    @Override
    public LanguageResponse updateLanguage(Long resumeId, Long languageId, Long candidateId, AddLanguageRequest req) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Language language = getEntityById(languageId, resumeId);

        language.setLanguageName(req.getLanguageName());
        language.setProficiency(req.getProficiency());
        if (req.getDisplayOrder() != null) language.setDisplayOrder(req.getDisplayOrder());

        return ResumeMapper.toLanguageResponse(languageRepository.save(language));
    }

    @Override
    public void deleteLanguage(Long resumeId, Long languageId, Long candidateId) throws Exception {
        Resume resume = resumeService.getResumeEntityById(resumeId);
        assertOwner(resume, candidateId);
        Language language = getEntityById(languageId, resumeId);
        languageRepository.delete(language);
    }

    private Language getEntityById(Long id, Long resumeId) throws Exception {
        Language lang = languageRepository.findById(id)
                .orElseThrow(() -> new Exception("Language not found with id: " + id));
        if (!lang.getResume().getId().equals(resumeId))
            throw new Exception("Language does not belong to this resume");
        return lang;
    }

    private void assertOwner(Resume resume, Long candidateId) throws Exception {
        if (!resume.getCandidateId().equals(candidateId))
            throw new Exception("You do not have access to this resume");
    }
}
